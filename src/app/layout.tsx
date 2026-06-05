import type { Metadata, Viewport } from "next";
import MouseFollowerCursor from "../components/MouseFollowerCursor";
import "mouse-follower/dist/mouse-follower.min.css";
import "./globals.css";

const siteUrl = "https://www.aaravkashyap.live";
const siteTitle = "Aarav Kashyap Singh - AI Engineer & Full Stack Developer";
const siteDescription =
  "Personal portfolio of Aarav Kashyap Singh, an AI Engineer and Full Stack Developer building intelligent products, agentic RAG systems, backend workflows, and automation tools.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Aarav Kashyap Singh Portfolio",
      url: siteUrl,
      description: siteDescription,
      publisher: {
        "@id": `${siteUrl}/#person`,
      },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      name: siteTitle,
      description: siteDescription,
      mainEntity: {
        "@id": `${siteUrl}/#person`,
      },
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Aarav Kashyap Singh",
      url: siteUrl,
      image: `${siteUrl}/og-image.svg`,
      jobTitle: "AI Engineer and Full Stack Developer",
      email: "mailto:aaravkashyap1203@gmail.com",
      sameAs: [
        "https://github.com/AaravKashyap12",
        "https://www.linkedin.com/in/aarav-singh-3a6351289",
        "https://x.com/byaarav",
      ],
      knowsAbout: [
        "AI engineering",
        "Full stack development",
        "Agentic RAG systems",
        "LangChain",
        "LangGraph",
        "FastAPI",
        "Next.js",
        "Automation workflows",
      ],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Undergraduate student",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Aarav Kashyap Singh Portfolio",
  keywords: [
    "Aarav Kashyap Singh",
    "AI Engineer",
    "Full Stack Developer",
    "Agentic RAG",
    "LangChain",
    "LangGraph",
    "FastAPI",
    "Next.js",
    "AI portfolio",
  ],
  robots: "index, follow",
  authors: [{ name: "Aarav Kashyap Singh", url: siteUrl }],
  creator: "Aarav Kashyap Singh",
  publisher: "Aarav Kashyap Singh",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Aarav Kashyap Singh",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Aarav Kashyap Singh - AI Engineer and Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    creator: "@byaarav",
    images: ["/og-image.svg"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <MouseFollowerCursor />
        {children}
      </body>
    </html>
  );
}
