import type { Metadata } from "next";
import { Black_Ops_One, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const blackOps = Black_Ops_One({
  weight: "400",
  variable: "--font-gaming",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dopamine Arena",
  description:
    "Herní aréna s Crash, Mines, Dice, Sloty a Plinko. Fun casino simulátor s Appwrite sync.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${inter.variable} ${blackOps.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
