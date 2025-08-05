
"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CardTitle } from "./ui/card";

export function CreateTask() {
  const { account, signAndSubmitTransaction } = useWallet();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState("");

  const createTask = async () => {
    if (!account || !title || !description) return;

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::task_manager::create_task`,
          functionArguments: [title, description, authorizedUsers],
        },
      });

      const executedTransaction: any = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });

      const event: any = executedTransaction.events.find(
        (event: any) =>
          event.type === `${MODULE_ADDRESS}::task_manager::TaskCreatedEvent`
      );

      if (event) {
        const taskId = event.data.task_id;
        toast({
          title: "Success",
          description: `Task created successfully, task id: ${taskId}`,
        });
        setTitle("");
        setDescription("");
        setAuthorizedUsers([]);
        router.push(`/task/${taskId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addAuthorizedUser = () => {
    if (newUser && !authorizedUsers.includes(newUser)) {
      setAuthorizedUsers([...authorizedUsers, newUser]);
      setNewUser("");
    }
  };

  const removeAuthorizedUser = (user: string) => {
    setAuthorizedUsers(authorizedUsers.filter((u) => u !== user));
  };

  return (
    <div className="flex flex-col gap-4">
      <CardTitle>Create a New Task</CardTitle>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
      />

      <div>
        <h3 className="text-lg font-semibold">Initial Authorized Users</h3>
        <div className="flex gap-2 mt-2">
          <Input
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter user address"
          />
          <Button onClick={addAuthorizedUser}>Add User</Button>
        </div>
        <ul className="mt-2 space-y-2">
          {authorizedUsers.map((user) => (
            <li
              key={user}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <span>{user}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeAuthorizedUser(user)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={createTask} className="btn btn-primary">
        Create Task
      </Button>
    </div>
  );
}
