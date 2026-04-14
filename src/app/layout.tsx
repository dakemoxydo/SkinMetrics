import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';
import { PortfolioProvider } from '@/store/portfolioStore';
import { ToastProvider } from '@/components/ui/Toast';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { ServiceWorkerProvider } from '@/components/providers/ServiceWorkerProvider';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'SkinMetrics - CS2 Portfolio Tracker',
  description: 'Track value, profit and ROI of your CS2 portfolio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkinMetrics',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className="bg-slate-900 text-slate-100 antialiased transition-colors duration-200"
        style={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <NextAuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <PortfolioProvider>
                <ToastProvider>
                  <ServiceWorkerProvider />
                  <div className="min-h-screen">{children}</div>
                  <ToastContainer />
                </ToastProvider>
              </PortfolioProvider>
            </ThemeProvider>
          </LanguageProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
