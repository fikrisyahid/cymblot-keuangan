'use client';

import { PRIMARY_COLOR, SECONDARY_COLOR } from '@/config/color';
import sidebarMenu from '@/data/sidebar';
import { AppShell, Burger, Button, Flex, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [opened, { open, close, toggle }] = useDisclosure(true);
  const pathName = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto open or close sidebar
  useEffect(() => {
    if (isMobile) {
      close();
    }
    if (!isMobile) {
      open();
    }
  }, [open, close, isMobile]);

  return (
    <AppShell
      layout="alt"
      padding="md"
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
    >
      <AppShell.Navbar
        p="sm"
        style={{ backgroundColor: SECONDARY_COLOR }}
        withBorder={false}
      >
        <Flex direction="column" gap="xs" align="center">
          <Burger opened onClick={toggle} color="white" hiddenFrom="sm" />
          <Title
            size={24}
            style={{ textAlign: 'center', color: 'white' }}
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
                width: '100%',
                backgroundColor:
                  pathName === item.route ? PRIMARY_COLOR : SECONDARY_COLOR,
                color: 'white',
              }}
            >
              {item.title}
            </Button>
          ))}
        </Flex>
      </AppShell.Navbar>
      <AppShell.Main style={{ backgroundColor: '#f4f4f4' }}>
        <Flex direction="column" gap="sm">
          <Burger opened={false} onClick={toggle} />
          {children}
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
