import type { ReactNode } from "react";
import Sidebar from "../components/sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className=" flex w-full h-full">
      <Sidebar />
      <main className="flex-1 flex ">
        <div
          className=" sm:w-[25rem] md:w-[22rem]
          w-0 "
        ></div>
        {children}
      </main>
    </div>
  );
}
