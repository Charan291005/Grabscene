import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EvaluatorToolbar } from "@/components/demo/EvaluatorToolbar";
import { EmailPreviewDrawer } from "@/components/demo/EmailPreviewDrawer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#071217",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "GrabScene — High-Concurrency Event Ticketing",
    template: "%s | GrabScene",
  },
  description:
    "GrabScene is a production-grade ticketing engine built to withstand massive demand spikes with strict ACID compliance, row-level locking, and real-time WebSockets.",
  keywords: [
    "ticketing",
    "event booking",
    "seat map",
    "real-time",
    "concurrency",
    "PostgreSQL",
  ],
  openGraph: {
    title: "GrabScene — High-Concurrency Event Ticketing",
    description:
      "Book seats in real time with ACID-compliant row-level locking and live WebSocket synchronisation.",
    type: "website",
    locale: "en_GB",
    siteName: "GrabScene",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  if (session?.user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", session.user.id)
      .single();
    profile = data;
  }
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased font-sans bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-bms-red focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        <AuthProvider initialSession={session} initialProfile={profile}>
          {children}
          <EvaluatorToolbar />
          <EmailPreviewDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
