// src/app/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login-এর সময় আমরা accessToken কুকি সেট করব
  const token =
    cookies().get("accessToken")?.value || cookies().get("sg_admin")?.value; // থাকলে ব্যাকআপ কুকি

  if (!token) {
    redirect("/login"); // লগইন না থাকলে সরাসরি রিডাইরেক্ট
  }
  return <>{children}</>;
}
