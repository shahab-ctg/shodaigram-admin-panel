import AppShell from "@/components/AppShell";
import { Outfit } from "next/font/google"; //
import "./globals.css";
import Providers from './providers';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

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
    <html lang="en" className={outfit.variable}>
      <body className="font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
