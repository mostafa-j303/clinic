import data from "../../public/data.json";
import type { Metadata } from "next";
import  { Roboto } from "next/font/google";
import "./globals.css";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import { CartContextProvider } from "./_context/CartContext";

const inter = Roboto({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: data.webtitle,
  description: "Generated by create next app (MJ-303)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartContextProvider>
    <html lang="en">
      <body className={inter.className}>
        <Header></Header>
        {children}</body>
        <Footer></Footer>
    </html>
    </CartContextProvider>
  );
}
