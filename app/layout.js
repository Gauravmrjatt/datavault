import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { OfflineIndicator } from '@/components/offline-indicator';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata = {
  title: 'DataVault - Cloud Storage',
  description: 'Telegram-backed production cloud file manager with unlimited storage',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DataVault',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-[var(--font-manrope)]`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <OfflineIndicator />
            <PWAInstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
