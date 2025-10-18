export const metadata = {
  title: "ShodaiGram-Orders",
  description: "An Exclusive Orgranic Products Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
