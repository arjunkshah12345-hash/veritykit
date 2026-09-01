import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL("https://verity.arjunshah.xyz"),
  title: {
    default: "Verity - train language models in TypeScript",
    template: "%s - Verity",
  },
  description: "Open-source TypeScript training. SFT, DPO, and GRPO. One trainer.",
  openGraph: {
    title: "Verity - train language models in TypeScript",
    description: "Open-source TypeScript training. SFT, DPO, and GRPO.",
    type: "website",
    url: "https://verity.arjunshah.xyz",
    images: [{ url: "/og.png", width: 1200, height: 675, alt: "Verity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verity - train language models in TypeScript",
    description: "Open-source TypeScript training. SFT, DPO, and GRPO.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/mark.png", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
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
