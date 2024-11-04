'use client';

import sidebarMenu from '@/data/sidebar';
import { UserButton } from '@clerk/nextjs';
import { AppShell, Burger, Button, Flex, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import clsx from 'clsx';

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
      <AppShell.Navbar p="sm" className="bg-secondary" withBorder={false}>
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
              className={clsx(
                'w-full text-white hover:bg-primary',
                pathName === item.route ? 'bg-primary' : 'bg-secondary',
              )}
            >
              {item.title}
            </Button>
          ))}
        </Flex>
      </AppShell.Navbar>
      <AppShell.Main className="bg-gray-50">
        <Flex direction="column" gap="sm">
          <div className="rounded-lg fixed z-50 bg-white self-start p-1 top-2 shadow-md">
            <Burger opened={false} onClick={toggle} size="sm" />
          </div>
          <div className="self-end">
            <UserButton />
          </div>
          {children}
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
