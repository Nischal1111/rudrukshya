"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Container } from "@/HOC/Container";
import { Sidebar } from "@/component/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster />
          {isLoginPage ? (
            <main>{children}</main>
          ) : (
            <Sidebar>
              <Container>
                {children}
              </Container>
            </Sidebar>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}