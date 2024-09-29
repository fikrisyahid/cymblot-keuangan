import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Poppins } from 'next/font/google';
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { TEXT_COLOR } from '@/config/color';
import RootShell from './components/shell';
import ProgressBar from './components/progress-bar';
import ClientDatesProvider from './components/dates-provider';

import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@mantine/charts/styles.css';

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
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        </head>
        <body className="antialiased">
          <MantineProvider
            theme={{
              fontFamily: poppins.style.fontFamily,
              components: {
                Text: {
                  styles: {
                    root: {
                      color: TEXT_COLOR,
                    },
                  },
                },
                Title: {
                  styles: {
                    root: {
                      color: TEXT_COLOR,
                    },
                  },
                },
              },
            }}
          >
            <ClientDatesProvider>
              <ModalsProvider>
                <Notifications />
                <SignedOut>
                  <div className="flex justify-center items-center min-h-screen">
                    <SignIn routing="hash" />
                  </div>
                </SignedOut>
                <SignedIn>
                  <ProgressBar />
                  <RootShell>{children}</RootShell>
                </SignedIn>
              </ModalsProvider>
            </ClientDatesProvider>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
