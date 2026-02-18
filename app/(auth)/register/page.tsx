"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
  Box,
  Group,
  ThemeIcon,
  List,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { register } from "@/app/actions/auth";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconCurrencyDollar,
  IconWallet,
  IconChartPie,
  IconBell,
  IconTargetArrow,
  IconSun,
  IconMoon,
  IconBrandGithub,
} from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) =>
        value.length >= 2 ? null : "Nama minimal 2 karakter",
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Email tidak valid",
      password: (value) =>
        value.length >= 6 ? null : "Password minimal 6 karakter",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Password tidak cocok",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);

    const result = await register(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Akun berhasil dibuat",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      router.push("/dashboard");
      router.refresh();
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Terjadi kesalahan",
        color: "red",
        icon: <IconX size={18} />,
      });
      setError(result.error || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  const benefits = [
    { icon: IconWallet, text: "Kelola banyak akun keuangan" },
    { icon: IconChartPie, text: "Kategorisasi & analisis pengeluaran" },
    { icon: IconBell, text: "Pengingat tagihan otomatis" },
    { icon: IconTargetArrow, text: "Atur anggaran & target finansial" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      {/* Top-right action buttons */}
      <Group
        gap="xs"
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 100,
        }}
      >
        <Tooltip label="Source Code" withArrow>
          <ActionIcon
            variant="light"
            size="lg"
            radius="xl"
            color="gray"
            component="a"
            href="https://github.com/fikrisyahid/cymblot-keuangan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source Code"
          >
            <IconBrandGithub size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={isDark ? "Mode terang" : "Mode gelap"} withArrow>
          <ActionIcon
            variant="light"
            size="lg"
            radius="xl"
            onClick={() => toggleColorScheme()}
            color={isDark ? "yellow" : "blue"}
            aria-label="Toggle color scheme"
          >
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
      {/* Left side - Form */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        <Paper
          radius="lg"
          p="xl"
          style={{ width: "100%", maxWidth: 440 }}
        >
          {/* Mobile logo */}
          <Group gap="sm" mb="lg" hiddenFrom="md" justify="center">
            <ThemeIcon
              size={40}
              radius="xl"
              variant="gradient"
              gradient={{ from: "teal", to: "blue", deg: 135 }}
            >
              <IconCurrencyDollar size={22} />
            </ThemeIcon>
            <Title order={3}>Cymblot</Title>
          </Group>

          <Title order={2} ta="center" mb={4}>
            Buat Akun Baru 🚀
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            Mulai perjalanan finansialmu sekarang
          </Text>

          {error && (
            <Alert color="red" mb="md" variant="light" radius="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Nama"
                placeholder="Nama lengkap"
                required
                size="md"
                radius="md"
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Email"
                placeholder="email@example.com"
                required
                size="md"
                radius="md"
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Minimal 6 karakter"
                required
                size="md"
                radius="md"
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                required
                size="md"
                radius="md"
                {...form.getInputProps("confirmPassword")}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                mt="md"
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "teal", to: "blue", deg: 135 }}
              >
                Daftar
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="xl" size="sm">
            Sudah punya akun?{" "}
            <Anchor href="/login" fw={600} c="blue">
              Masuk di sini
            </Anchor>
          </Text>
        </Paper>
      </Box>

      {/* Right side - Branding */}
      <Box
        visibleFrom="md"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative shapes */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <Box style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          <Group gap="sm" mb="xl">
            <ThemeIcon size={50} radius="xl" variant="white" color="blue">
              <IconCurrencyDollar size={28} />
            </ThemeIcon>
            <Title order={1} c="white" style={{ fontSize: 36 }}>
              Cymblot
            </Title>
          </Group>

          <Title order={2} c="white" mb="md" style={{ fontWeight: 400, lineHeight: 1.4 }}>
            Bergabung dan mulai{" "}
            <Text span fw={700} inherit>
              kontrol keuanganmu
            </Text>
          </Title>

          <Text c="rgba(255,255,255,0.8)" size="lg" mb="xl">
            Ribuan orang sudah menggunakan Cymblot untuk mengelola keuangan
            mereka. Saatnya giliran kamu!
          </Text>

          <Stack gap="md" mt="xl">
            {benefits.map((b, i) => (
              <Group key={i} gap="md">
                <ThemeIcon
                  size={44}
                  radius="md"
                  variant="filled"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <b.icon size={22} color="white" />
                </ThemeIcon>
                <Text c="white" fw={500} size="sm">
                  {b.text}
                </Text>
              </Group>
            ))}
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
