"use client";

import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store/StoreContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <StoreProvider>
        {children}
      </StoreProvider>
    </ThemeProvider>
  );
}
