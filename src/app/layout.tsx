import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import ProgressProvider from "@/components/progressbar-provider";
import RootShell from "./shell";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Aplikasi Keuangan Cymblot",
  description: "Made with NextJS",
};

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
        <body>
          <SignedOut>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
              }}
            >
              <SignIn routing="hash" />
            </div>
          </SignedOut>
          <SignedIn>
            <ProgressProvider>
              <MantineProvider
                theme={{
                  fontFamily: poppins.style.fontFamily,
                }}
              >
                <Notifications />
                <ModalsProvider>
                  <RootShell>
                    <div
                      style={{
                        position: "fixed",
                        top: 16,
                        right: 16,
                        zIndex: 0,
                      }}
                    >
                      <UserButton />
                    </div>
                    <div style={{ zIndex: 1 }}>{children}</div>
                  </RootShell>
                </ModalsProvider>
              </MantineProvider>
            </ProgressProvider>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
