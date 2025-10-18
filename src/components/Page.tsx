import { ReactNode } from "react";
export default function Page({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div>{actions}</div>
      </div>
      <div className="card p-4">{children}</div>
    </div>
  );
}
