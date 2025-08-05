"use client";

import TaskManager from "@/components/TaskManager";
import { Header } from "@/components/Header";
import { useParams } from "next/navigation";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.id as string;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <TaskManager taskId={taskId} />
      </div>
    </>
  );
}
