import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Poppins } from 'next/font/google';
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import RootShell from './components/shell';

import './globals.css';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';

export const metadata: Metadata = {
  title: 'Cymblot Keuangan',
  description: 'Aplikasi keuangan sederhana',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body className="antialiased">
          <MantineProvider
            theme={{
              fontFamily: poppins.style.fontFamily,
            }}
          >
            <SignedOut>
              <div className="flex justify-center items-center min-h-screen">
                <SignIn routing="hash" />
              </div>
            </SignedOut>
            <SignedIn>
              <RootShell>{children}</RootShell>
            </SignedIn>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
