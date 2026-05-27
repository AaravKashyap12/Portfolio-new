import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "Aarav Kashyap Singh - AI Engineer",
  description:
    "Personal portfolio of Aarav Kashyap Singh, an AI Engineer and Full Stack Developer building intelligent products, backend workflows, and automation tools.",
  robots: "index, follow",
  authors: [{ name: "Aarav Kashyap Singh", url: "https://github.com/AaravKashyap12" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
