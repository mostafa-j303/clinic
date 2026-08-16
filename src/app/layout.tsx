"use client";
import { Figtree, Noto_Sans } from "next/font/google";
import "./globals.css";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import { CartContextProvider } from "./_context/CartContext";
import ScrollToTop from "./_components/ScrollToTop";
import { SettingsProvider } from "./_context/SettingsContext";
import { AdminAuthProvider } from "./_context/AdminAuthContext";
import { ThemeProvider } from "./_context/ThemeContext";
import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import AppLoading from "./_components/Apploading";
import { useSettings } from "./_context/SettingsContext";
import { SessionProvider } from "next-auth/react";

const ADMIN_ROUTES = ["/Setting", "/Orders", "/IntakeForms", "/Appointments", "/Users"];

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
});
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

// Inner component that uses the hook (AFTER provider)
function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings, loading } = useSettings();
  const pathname = usePathname();
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (!settings?.colors) return;

    const root = document.documentElement;

    root.style.setProperty("--color-primary", settings.colors.primary);
    root.style.setProperty("--color-hovprimary", settings.colors.hovprimary);
    root.style.setProperty("--color-secondary", settings.colors.secondary);
    root.style.setProperty(
      "--color-hovsecondary",
      settings.colors.hovsecondary
    );
    root.style.setProperty("--color-accent", settings.colors.accent);
  }, [settings]);

  // Show loading screen while settings are being fetched
  if (loading) {
    return <AppLoading />;
  }

  // Admin pages get their own shell (AdminShell, rendered by each admin page)
  // instead of the public site's Header/Footer.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-[70px]">{children}</main>
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before paint, to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${figtree.variable} ${notoSans.variable} font-body`}>
        <SessionProvider>
          <CartContextProvider>
            <SettingsProvider>
              <AdminAuthProvider>
                <ThemeProvider>
                  <Suspense fallback={<AppLoading />}>
                    <AppContent>{children}</AppContent>
                  </Suspense>
                </ThemeProvider>
              </AdminAuthProvider>
            </SettingsProvider>
          </CartContextProvider>
        </SessionProvider>
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
