import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

/** Display e texto: Mona Sans variável (peso 200–900, largura 75–125). */
const mona = localFont({
  src: "./fonts/MonaSans-var.woff2",
  variable: "--font-mona",
  weight: "200 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 125%" }],
});

/** Labels editoriais. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GAVEA / BUILD 2030",
  description:
    "Uma nova camada de direção para conectar marketing, negócio e inteligência. AERA × GAVEA.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${mona.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-[var(--navy-deep)] text-[var(--white)] grain">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
