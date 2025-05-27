import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from '@/components/firebase-provider'; // Import FirebaseProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Covenant Chat',
  description: 'AI-powered Q&A for HOA covenant documents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <FirebaseProvider> {/* Wrap children with FirebaseProvider */}
          {children}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
