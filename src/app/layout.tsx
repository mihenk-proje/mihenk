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

const BASLIK = "MİHENK — NSosyal Katılım Katmanı"
const ACIKLAMA =
  "Nitelikli paylaşımı ödüllendiren, kopya ve düşük çabalı içeriği ayıklayan " +
  "katılım katmanı prototipi. Ödül, paylaşım miktarına değil içeriğin otomatik " +
  "denetimden geçip geçmediğine bağlanır."

/*
  Bağlantı önizlemesi. Simgeler src/app altındaki dosya adlarından otomatik
  bağlanır: icon.png, apple-icon.png, favicon.ico, opengraph-image.png.
*/
export const metadata: Metadata = {
  /*
    Bağlantı önizlemesindeki görsel mutlak adres ister. Bu verilmezse Next
    istek adresinden türetir ve üretimde localhost'a çözülebilir.
    Vercel dağıtımında VERCEL_URL doludur; yerelde yayın adresine düşer.
  */
  metadataBase: new URL(
    process.env.VERCEL_ENV === 'production'
      ? 'https://mihenk-proje.vercel.app'
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://mihenk-proje.vercel.app'
  ),
  title: BASLIK,
  description: ACIKLAMA,
  applicationName: "MİHENK",
  openGraph: {
    title: BASLIK,
    description: ACIKLAMA,
    siteName: "MİHENK",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BASLIK,
    description: ACIKLAMA,
  },
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
