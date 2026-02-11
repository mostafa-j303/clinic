"use client";
import data from "../../public/data.json";
import { Roboto } from "next/font/google";
import "./globals.css";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import { CartContextProvider } from "./_context/CartContext";
import ScrollToTop from "./_components/ScrollToTop";
import { SettingsProvider } from "./_context/SettingsContext";
import { AdminAuthProvider } from "./_context/AdminAuthContext";
import { Suspense, useEffect } from "react";
import AppLoading from "./_components/Apploading";
import { useSettings } from "./_context/SettingsContext";

const inter = Roboto({ subsets: ["latin"], weight: "700" });

// Inner component that uses the hook (AFTER provider)
function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {settings, loading } = useSettings();

  useEffect(() => {
  if (!settings?.colors) return;

  const root = document.documentElement;

  root.style.setProperty("--color-primary", settings.colors.primary);
  root.style.setProperty("--color-hovprimary", settings.colors.hovprimary);
  root.style.setProperty("--color-secondary", settings.colors.secondary);
  root.style.setProperty("--color-hovsecondary", settings.colors.hovsecondary);
}, [settings]);

  // Show loading screen while settings are being fetched
  if (loading) {
    return <AppLoading />;
  }

  return (
    <>
      <Header />
      <main className="pt-[70px]">
        {children}
      </main>
      <ScrollToTop />
      <Footer />
    </>
  );
}

// Outer component structure
function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartContextProvider>
          <SettingsProvider>
            <AdminAuthProvider>
              <Suspense fallback={<AppLoading />}>
                <AppContent>{children}</AppContent>
              </Suspense>
            </AdminAuthProvider>
          </SettingsProvider>
        </CartContextProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}