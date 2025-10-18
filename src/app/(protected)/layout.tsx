
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const cookieStore = await cookies();
  const token =
    cookieStore.get("accessToken")?.value || cookieStore.get("sg_admin")?.value; // থাকলে ব্যাকআপ কুকি

  if (!token) {
    redirect("/login");
  }
  return <>{children}</>;
}
