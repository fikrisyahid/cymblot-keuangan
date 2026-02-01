"use client";

import { usePathname } from "next/navigation";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  useMantineColorScheme,
  ActionIcon,
  Divider,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconWallet,
  IconCategory,
  IconArrowsExchange,
  IconChartBar,
  IconReceipt,
  IconUsers,
  IconSettings,
  IconSun,
  IconMoon,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: IconHome },
  { label: "Akun", href: "/dashboard/accounts", icon: IconWallet },
  { label: "Kategori", href: "/dashboard/categories", icon: IconCategory },
  { label: "Transaksi", href: "/dashboard/transactions", icon: IconArrowsExchange },
  { label: "Anggaran", href: "/dashboard/budgets", icon: IconChartBar },
  { label: "Recurring", href: "/dashboard/recurring", icon: IconReceipt },
  { label: "Utang/Piutang", href: "/dashboard/debts", icon: IconUsers },
];

const bottomNavItems = [
  { label: "Pengaturan", href: "/dashboard/settings", icon: IconSettings },
];

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  const handleLogout = async () => {
    close();
    notifications.show({
      title: "Berhasil",
      message: "Kamu telah logout",
      color: "green",
    });
    setTimeout(async () => {
      await logout();
      router.push("/login");
      router.refresh();
    }, 500);
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} c="blue">
              💰 Cymblot
            </Title>
          </Group>
          <Group>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => toggleColorScheme()}
              aria-label="Toggle color scheme"
            >
              {colorScheme === "dark" ? (
                <IconSun size={20} />
              ) : (
                <IconMoon size={20} />
              )}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap={4}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={pathname === item.href}
                onClick={close}
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-md)",
                  },
                }}
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Stack gap={4}>
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={pathname === item.href}
                onClick={close}
                styles={{
                  root: {
                    borderRadius: "var(--mantine-radius-md)",
                  },
                }}
              />
            ))}
            <NavLink
              label="Logout"
              leftSection={<IconLogout size={20} stroke={1.5} />}
              onClick={handleLogout}
              c="red"
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                },
              }}
            />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
