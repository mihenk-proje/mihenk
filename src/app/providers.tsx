"use client";

import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store/kanca";

/*
  Tema işletim sistemi tercihine uyar. Kullanıcı düğmeyle değiştirirse seçimi
  kaydedilir ve sistem tercihini ezer; hiç dokunmamışsa sistem tercihi geçerli
  kalır.

  Rapor Tablo 10, hareket duyarlılığı için prefers-reduced-motion tercihine
  uyulduğunu taahhüt ediyor. Tema tercihinde uymamak bu tutarlılığı bozuyordu.
*/
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
