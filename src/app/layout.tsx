import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MintForge — Forge the First Cards",
  description:
    "MintForge is a card game of living legends bound to cards on the sacred anvil. Meet the three gods of the forge.",
};

export const viewport: Viewport = {
  themeColor: "#16181a",
};

// Chromium-only: lets .glass-refract use an SVG displacement filter in backdrop-filter.
const detectChromium = `try{if(navigator.userAgentData&&navigator.userAgentData.brands.some(function(b){return /Chrom/.test(b.brand)}))document.documentElement.classList.add('chromium')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${manrope.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: detectChromium }} />
      </head>
      <body className="grain min-h-dvh">
        {/* Shared SVG filters */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="liquid-refract" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="3" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
            <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
