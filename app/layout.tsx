import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loantools.in";
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LoanTools — Know your real loan cost",
    template: "%s · LoanTools",
  },
  description:
    "A free, private Indian loan calculator that shows your EMI, interest, principal, amortization schedule and true cost of borrowing — no login, no data collection.",
  keywords: [
    "EMI calculator",
    "loan calculator India",
    "true cost of loan",
    "amortization schedule",
    "processing fee calculator",
    "tenure comparison",
  ],
  applicationName: "LoanTools",
  authors: [{ name: "LoanTools" }],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "LoanTools",
    title: "LoanTools — Know your real loan cost",
    description:
      "See exactly how your EMI is calculated, what your loan really costs, and how tenure changes affect total interest — entirely in your browser.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "LoanTools — Know your real loan cost",
    description:
      "A private, no-login Indian loan calculator: EMI, amortization, charges and true cost, calculated entirely in your browser.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body>
        <AmbientBackground />
        {children}
        {/*
          The AdSense loader is only injected when a publisher client ID is
          configured (see .env.example). Without it, AdSlot renders neutral
          placeholders instead of making any third-party network request —
          nothing is sent anywhere until you deliberately turn ads on.

          This is a plain HTML <script> tag, not next/script: next/script
          never emits a literal <script src> into the server-rendered HTML
          in the app directory (any strategy) — it only emits a preload
          link plus a runtime-inserted tag, which AdSense's non-JS site
          crawler can't see. A raw tag here is rendered verbatim by the
          Server Component, matching exactly what AdSense's verification
          step asks for.
        */}
        {ADSENSE_CLIENT_ID ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
