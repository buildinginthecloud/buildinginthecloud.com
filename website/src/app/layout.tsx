import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Building in the Cloud",
    template: "%s | Building in the Cloud",
  },
  description:
    "AWS insights, CDK best practices, and cloud infrastructure tips from Yvo van Zee, Cloud Consultant at Cloudar and AWS Community Builder.",
  keywords: [
    "AWS",
    "CDK",
    "Cloud",
    "Infrastructure",
    "Python",
    "TypeScript",
    "DevOps",
    "AWS Community Builder",
  ],
  authors: [{ name: "Yvo van Zee" }],
  creator: "Yvo van Zee",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://buildinginthecloud.com",
    title: "Building in the Cloud",
    description:
      "AWS insights, CDK best practices, and cloud infrastructure tips from Yvo van Zee.",
    siteName: "Building in the Cloud",
  },
  twitter: {
    card: "summary_large_image",
    title: "Building in the Cloud",
    description:
      "AWS insights, CDK best practices, and cloud infrastructure tips.",
    creator: "@yvthepief",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
