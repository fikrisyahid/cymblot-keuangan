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
import { register } from "@/app/actions/auth";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Paper radius="md" p="xl" withBorder shadow="xl" style={{ width: 420 }}>
      <Title order={2} ta="center" mb="md">
        Buat Akun Baru 🚀
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Daftar untuk mulai mengelola keuanganmu
      </Text>

      {error && (
        <Alert color="red" mb="md" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nama"
            placeholder="Nama lengkap"
            required
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Email"
            placeholder="email@example.com"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Minimal 6 karakter"
            required
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            required
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" fullWidth loading={loading} mt="md">
            Daftar
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="md" size="sm">
        Sudah punya akun?{" "}
        <Anchor href="/login" fw={500}>
          Masuk di sini
        </Anchor>
      </Text>
    </Paper>
  );
}
