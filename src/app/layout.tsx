import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { CartProvider } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "My POS - Point of Sale System",
  description: "Modern POS cashier system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <CartProvider>
          <TooltipProvider>
            <SidebarProvider
              style={
                {
                  "--sidebar-width": "19rem",
                } as React.CSSProperties
              }
            >
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </CartProvider>
      </body>
    </html>
  );
}
