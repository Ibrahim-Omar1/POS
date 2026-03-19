import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { CartProvider } from "@/hooks/use-cart";

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
        <NuqsAdapter>
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
        </NuqsAdapter>
      </body>
    </html>
  );
}
