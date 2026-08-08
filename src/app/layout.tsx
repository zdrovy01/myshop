import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MyShop by zdrovy",
  description: "Додаток для магазинів Żabka — MyShop by zdrovy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={inter.variable}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex flex-1 justify-center px-8">
            <div className="w-full max-w-2xl bg-white px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
