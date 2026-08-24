import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MİHENK - NSosyal Katılım Sistemi",
  description: "NSosyal için geliştirilmiş içerik doğrulama ve jeton kazanım katmanı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${manrope.variable} ${ibmPlexMono.variable} antialiased h-full`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
