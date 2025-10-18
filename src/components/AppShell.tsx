"use client";

import { usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login"; 
  return (
    <>
      {!isAuthRoute && <Topbar />}
      {children}
      {!isAuthRoute && <Footer />}
    </>
  );
}
