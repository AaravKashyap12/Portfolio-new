import type { Metadata, Viewport } from "next";
import MouseFollowerCursor from "../components/MouseFollowerCursor";
import "mouse-follower/dist/mouse-follower.min.css";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aaravkashyap.live"),
  title: "Aarav Kashyap Singh - AI Engineer",
  description:
    "Personal portfolio of Aarav Kashyap Singh, an AI Engineer and Full Stack Developer building intelligent products, backend workflows, and automation tools.",
  robots: "index, follow",
  authors: [{ name: "Aarav Kashyap Singh", url: "https://github.com/AaravKashyap12" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Aarav Kashyap Singh - AI Engineer",
    description:
      "AI Engineer and Full Stack Developer building intelligent products, backend workflows, and automation tools.",
    url: "https://www.aaravkashyap.live",
    siteName: "Aarav Kashyap Singh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aarav Kashyap Singh - AI Engineer",
    description:
      "AI Engineer and Full Stack Developer building intelligent products, backend workflows, and automation tools.",
  },
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
        <MouseFollowerCursor />
        {children}
      </body>
    </html>
  );
}
