import type { ReactNode } from "react";
import Sidebar from "../components/sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className=" flex w-full h-full relative">
      <Sidebar />
      <main className="flex-1 flex  mt-5 ">
        <div
          className="sm:w-[16rem]
          w-0 "
        ></div>
        {children}
      </main>
    </div>
  );
}
