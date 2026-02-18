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
  Text,
  Avatar,
  Box,
  Tooltip,
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
  IconCurrencyDollar,
} from "@tabler/icons-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: IconHome, color: "blue" },
  { label: "Akun", href: "/dashboard/accounts", icon: IconWallet, color: "cyan" },
  { label: "Kategori", href: "/dashboard/categories", icon: IconCategory, color: "grape" },
  { label: "Transaksi", href: "/dashboard/transactions", icon: IconArrowsExchange, color: "teal" },
  { label: "Anggaran", href: "/dashboard/budgets", icon: IconChartBar, color: "orange" },
  { label: "Recurring", href: "/dashboard/recurring", icon: IconReceipt, color: "indigo" },
  { label: "Utang/Piutang", href: "/dashboard/debts", icon: IconUsers, color: "pink" },
];



interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";

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
      header={{ height: 64 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      {/* Header */}
      <AppShell.Header
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(37, 38, 43, 0.97) 0%, rgba(44, 46, 51, 0.97) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 249, 252, 0.97) 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: isDark
            ? "1px solid rgba(255, 255, 255, 0.06)"
            : "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          </Group>
          <Group gap="sm">
            <Tooltip label={isDark ? "Mode terang" : "Mode gelap"} withArrow>
              <ActionIcon
                variant="light"
                size="lg"
                radius="xl"
                onClick={() => toggleColorScheme()}
                aria-label="Toggle color scheme"
                color={isDark ? "yellow" : "blue"}
              >
                {isDark ? (
                  <IconSun size={18} />
                ) : (
                  <IconMoon size={18} />
                )}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Pengaturan" withArrow>
              <ActionIcon
                variant="light"
                size="lg"
                radius="xl"
                color="gray"
                component={Link}
                href="/dashboard/settings"
                aria-label="Pengaturan"
              >
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Logout" withArrow>
              <ActionIcon
                variant="light"
                size="lg"
                radius="xl"
                color="red"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar
        p="md"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #1a1b1e 0%, #141517 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
          borderRight: isDark
            ? "1px solid rgba(255, 255, 255, 0.06)"
            : "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <AppShell.Section>
          <Box mb="lg" p="sm">
            <Group gap="sm">
              <Avatar
                size="md"
                radius="xl"
                color="blue"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 135 }}
              >
                <IconCurrencyDollar size={22} />
              </Avatar>
              <div>
                <Title order={4} style={{ lineHeight: 1.2 }}>
                  Cymblot
                </Title>
                <Text size="xs" c="dimmed">
                  Keuangan
                </Text>
              </div>
            </Group>
          </Box>
          <Divider mb="sm" />
        </AppShell.Section>

        <AppShell.Section grow>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs" px="sm">
            Menu
          </Text>
          <Stack gap={2}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={
                    <item.icon
                      size={20}
                      stroke={1.5}
                      color={isActive ? `var(--mantine-color-${item.color}-6)` : undefined}
                    />
                  }
                  active={isActive}
                  onClick={close}
                  color={item.color}
                  variant={isActive ? "light" : "subtle"}
                  styles={{
                    root: {
                      borderRadius: "var(--mantine-radius-md)",
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </AppShell.Section>


      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main
        style={{
          background: isDark
            ? "var(--mantine-color-dark-8)"
            : "#f1f3f5",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
