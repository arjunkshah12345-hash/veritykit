import type { Metadata } from "next";
import { Covered_By_Your_Grace, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const grace = Covered_By_Your_Grace({
  variable: "--font-grace",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Verity — Train models on unverifiable data",
    template: "%s — Verity",
  },
  description:
    "A TypeScript training framework. SFT, preference, GRPO, and JEPO. Execute the work so you can score it.",
  openGraph: {
    title: "Verity — Train models on unverifiable data",
    description: "Make the unverifiable trainable. Bridges turn outputs into witnesses.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 675, alt: "Verity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verity — Train models on unverifiable data",
    description: "Make the unverifiable trainable. Bridges turn outputs into witnesses.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/mark.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} ${grace.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
