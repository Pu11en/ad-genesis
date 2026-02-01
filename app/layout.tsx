import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Ad Genesis | AI-Powered Ad Creation Studio',
  description: 'Transform your product into stunning ad creatives with AI. From concept to campaign in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-surface-0 text-white antialiased font-sans">
        <div className="fixed inset-0 bg-mesh opacity-50 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-genesis-950/20 via-transparent to-purple-950/20 pointer-events-none" />
        <main className="relative min-h-screen">
          {children}
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
