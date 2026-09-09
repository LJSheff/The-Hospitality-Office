import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hospitality Office | Food, thoughtfully hosted",
  description: "Thoughtful food for teams, gatherings and events.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
