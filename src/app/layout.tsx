import "@/styles/globals";
import Providers from "./providers";
import AppShell from "@/components/AppShell";

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
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
