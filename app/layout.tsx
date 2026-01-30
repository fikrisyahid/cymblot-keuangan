import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import "./globals.css"

import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core';
import { Poppins } from 'next/font/google';
import { Notifications } from '@mantine/notifications';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const theme = createTheme({
  fontFamily: poppins.style.fontFamily,
});

export const metadata = {
  title: 'Cymblot Keuangan',
  description: 'Aplikasi Keuangan Sederhana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={poppins.className}>
        <MantineProvider theme={theme}>
          <Notifications position="top-center" />
          {children}</MantineProvider>
      </body>
    </html>
  );
}