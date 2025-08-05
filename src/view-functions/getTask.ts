import { surfClient } from "@/utils/surfClient";
import { TASK_MANAGER_ABI } from "@/utils/task_manager_abi";

export const getTask = async (): Promise<[string, string, boolean]> => {
  const task = await surfClient()
    .useABI(TASK_MANAGER_ABI)
    .view.get_task({
      functionArguments: [],
      typeArguments: [],
    })
    .catch((error) => {
      console.error(error);
      return ["", "", false];
    });

  return task;
};