import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { AccentProvider } from "@/lib/accent-context";
import BottomNav from "@/components/BottomNav";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "روتين",
  description: "عاداتك وأهدافك في مكان واحد",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <ThemeProvider>
          <AccentProvider>
            <div className="mx-auto flex min-h-dvh max-w-md flex-col">
              <main className="flex-1 pb-24">{children}</main>
              <BottomNav />
            </div>
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
