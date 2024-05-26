"use client";

import sidebarMenu from "@/data/sidebar";
import { AppShell, Burger, Button, Flex, Title } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [opened, { close, toggle }] = useDisclosure(true);
  const pathName = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  console.log(isMobile);

  return (
    <AppShell
      layout="alt"
      padding="md"
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
    >
      <AppShell.Navbar p="sm" style={{ backgroundColor: "#113F67" }}>
        <Flex direction="column" gap="xs" align="center">
          <Burger
            opened={true}
            onClick={toggle}
            color="white"
            hiddenFrom="sm"
          />
          <Title
            size={24}
            style={{ textAlign: "center", color: "white" }}
            mb="md"
          >
            Aplikasi Keuangan Cymblot
          </Title>
          {sidebarMenu.map((item) => (
            <Button
              key={item.title}
              leftSection={item.icon}
              href={item.route}
              justify="start"
              component={Link}
              onClick={isMobile ? close : () => {}}
              style={{
                width: "100%",
                backgroundColor:
                  pathName === item.route ? "#38598b" : "#113F67",
                color: "white",
              }}
            >
              {item.title}
            </Button>
          ))}
        </Flex>
      </AppShell.Navbar>
      <AppShell.Main>
        <Burger opened={false} onClick={toggle} />
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
