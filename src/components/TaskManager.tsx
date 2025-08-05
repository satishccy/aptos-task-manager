"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "./ui/use-toast";

export default function TaskManager({ taskId }: { taskId: string }) {
  const { account, signAndSubmitTransaction } = useWallet();
  const [task, setTask] = useState<{
    owner: string;
    title: string;
    description: string;
    completed: boolean;
    authorized_users: string[];
  } | null>(null);
  const [newAuthorizedUser, setNewAuthorizedUser] = useState("");

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      const taskData = await aptosClient().view({
        payload: {
          function: `${MODULE_ADDRESS}::task_manager::get_task`,
          functionArguments: [taskId],
        },
      });
      setTask({
        owner: taskData[0] as string,
        title: taskData[1] as string,
        description: taskData[2] as string,
        completed: taskData[3] as boolean,
        authorized_users: taskData[4] as string[],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const completeTask = async () => {
    if (!account || !taskId) return;
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::task_manager::complete_task`,
          functionArguments: [taskId],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      if (executedTransaction.success) {
        toast({
          title: "Success",
          description: `Task completed successfully, task id: ${taskId}`,
        });
        setTask((prevTask) => (prevTask ? { ...prevTask, completed: true } : null));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addAuthorizedUser = async () => {
    if (!account || !taskId || !newAuthorizedUser) return;
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::task_manager::add_authorized_user`,
          functionArguments: [taskId, newAuthorizedUser],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      if (executedTransaction.success) {
        toast({
          title: "Success",
          description: `User added successfully, task id: ${taskId}`,
        });
        setTask((prevTask) =>
          prevTask ? { ...prevTask, authorized_users: [...prevTask.authorized_users, newAuthorizedUser] } : null,
        );
        setNewAuthorizedUser("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeAuthorizedUser = async (userAddress: string) => {
    if (!account || !taskId) return;
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::task_manager::remove_authorized_user`,
          functionArguments: [taskId, userAddress],
        },
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      if (executedTransaction.success) {
        toast({
          title: "Success",
          description: `User removed successfully, task id: ${taskId}`,
        });
        setTask((prevTask) =>
          prevTask
            ? { ...prevTask, authorized_users: prevTask.authorized_users.filter((user) => user !== userAddress) }
            : null,
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId, account]);

  if (!task) {
    return <div>Loading...</div>;
  }

  const isOwner = account && account.address.toString() === task.owner;
  const isAuthorized = account && task.authorized_users.includes(account.address.toString());

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {task.title}
          {isOwner && <span className="text-sm text-muted-foreground"> (Owner)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LabelValueGrid
          items={[
            {
              label: "Description",
              value: <p className="text-muted-foreground">{task.description}</p>,
            },
            {
              label: "Status",
              value: (
                <p className={task.completed ? "text-green-500" : "text-yellow-500"}>
                  {task.completed ? "Completed" : "Incomplete"}
                </p>
              ),
            },
          ]}
        />
        {(isOwner || isAuthorized) && !task.completed && (
          <Button onClick={completeTask} className="mt-4">
            Mark as Complete
          </Button>
        )}
        {isOwner && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Authorized Users</h3>
            <div className="flex gap-2 mt-2">
              <Input
                value={newAuthorizedUser}
                onChange={(e) => setNewAuthorizedUser(e.target.value)}
                placeholder="Enter user address"
              />
              <Button onClick={addAuthorizedUser}>Add User</Button>
            </div>
            <ul className="mt-2 space-y-2">
              {task.authorized_users.map((user) => (
                <li key={user} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>{user}</span>
                  <Button variant="destructive" size="sm" onClick={() => removeAuthorizedUser(user)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
