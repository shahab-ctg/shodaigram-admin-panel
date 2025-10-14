import "@/styles/globals.css";
import Topbar from "@/components/Topbar";
export const metadata = {
  title: "Shodaigram Admin",
  description: "Admin panel for Shodaigram",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Topbar />
        {children}
      </body>
    </html>
  );
}
