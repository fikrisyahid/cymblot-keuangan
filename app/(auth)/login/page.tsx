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
  Grid,
  GridCol,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconCurrencyDollar,
  IconChartLine,
  IconShieldCheck,
  IconDeviceAnalytics,
} from "@tabler/icons-react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Email tidak valid",
      password: (value) =>
        value.length >= 1 ? null : "Password harus diisi",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await login(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Login berhasil",
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

  const features = [
    {
      icon: IconChartLine,
      title: "Lacak Keuangan",
      desc: "Pantau pemasukan & pengeluaran secara real-time",
    },
    {
      icon: IconShieldCheck,
      title: "Aman & Privat",
      desc: "Data keuanganmu tersimpan dengan aman",
    },
    {
      icon: IconDeviceAnalytics,
      title: "Analisis Cerdas",
      desc: "Laporan dan insight untuk keputusan finansial",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left side - Branding */}
      <Box
        visibleFrom="md"
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
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
            Kelola keuanganmu dengan{" "}
            <Text span fw={700} inherit>
              mudah dan cerdas
            </Text>
          </Title>

          <Text c="rgba(255,255,255,0.8)" size="lg" mb="xl">
            Aplikasi keuangan pribadi yang membantu kamu mengontrol pengeluaran,
            memantau pemasukan, dan mencapai tujuan finansialmu.
          </Text>

          <Stack gap="md" mt="xl">
            {features.map((f, i) => (
              <Group key={i} gap="md">
                <ThemeIcon
                  size={44}
                  radius="md"
                  variant="filled"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <f.icon size={22} color="white" />
                </ThemeIcon>
                <div>
                  <Text c="white" fw={600} size="sm">
                    {f.title}
                  </Text>
                  <Text c="rgba(255,255,255,0.7)" size="xs">
                    {f.desc}
                  </Text>
                </div>
              </Group>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right side - Form */}
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
              gradient={{ from: "blue", to: "grape", deg: 135 }}
            >
              <IconCurrencyDollar size={22} />
            </ThemeIcon>
            <Title order={3}>Cymblot</Title>
          </Group>

          <Title order={2} ta="center" mb={4}>
            Selamat Datang! 👋
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            Masuk ke akun Cymblot Keuangan
          </Text>

          {error && (
            <Alert color="red" mb="md" variant="light" radius="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
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
                placeholder="Password kamu"
                required
                size="md"
                radius="md"
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                mt="md"
                size="md"
                radius="md"
                variant="gradient"
                gradient={{ from: "blue", to: "grape", deg: 135 }}
              >
                Masuk
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="xl" size="sm">
            Belum punya akun?{" "}
            <Anchor href="/register" fw={600} c="blue">
              Daftar sekarang
            </Anchor>
          </Text>
        </Paper>
      </Box>
    </div>
  );
}
