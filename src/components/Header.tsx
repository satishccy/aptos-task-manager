import { useRouter } from "next/navigation";
import { WalletSelector } from "./WalletSelector";

export function Header() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 onClick={() => router.push("/")} className="display cursor-pointer">
        Task Manager
      </h1>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}
