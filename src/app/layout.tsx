import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { PortfolioProvider } from "@/store/portfolioStore";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "SkinMetrics — Отслеживание инвестиционного портфеля",
  description: "Отслеживайте стоимость, прибыль и ROI вашего портфеля предметов CS2 с помощью SkinMetrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-slate-900 text-slate-100 antialiased" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <PortfolioProvider>
          <ToastProvider>
            <div className="min-h-screen">
              {children}
            </div>
            <ToastContainer />
          </ToastProvider>
        </PortfolioProvider>
      </body>
    </html>
  );
}
