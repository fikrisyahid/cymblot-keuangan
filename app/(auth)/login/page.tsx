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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
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

  return (
    <Paper radius="md" p="xl" withBorder shadow="xl" style={{ width: 420 }}>
      <Title order={2} ta="center" mb="md">
        Selamat Datang! 👋
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Masuk ke Cymblot Keuangan
      </Text>

      {error && (
        <Alert color="red" mb="md" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Email"
            placeholder="email@example.com"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Password kamu"
            required
            {...form.getInputProps("password")}
          />

          <Button type="submit" fullWidth loading={loading} mt="md">
            Masuk
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="md" size="sm">
        Belum punya akun?{" "}
        <Anchor href="/register" fw={500}>
          Daftar sekarang
        </Anchor>
      </Text>
    </Paper>
  );
}
