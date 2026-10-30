import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Yellowtail } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail" });

export const metadata: Metadata = {
  title: "Wedding Invitation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${cormorant.variable} ${yellowtail.variable}`}>
      <body className="font-sans text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
