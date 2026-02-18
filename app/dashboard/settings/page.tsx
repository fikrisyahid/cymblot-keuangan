"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Switch,
  Group,
  PasswordInput,
  Button,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconLock } from "@tabler/icons-react";
import { changePassword } from "@/app/actions/auth";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: {
      currentPassword: (value) =>
        value.length >= 1 ? null : "Password lama harus diisi",
      newPassword: (value) =>
        value.length >= 6 ? null : "Password baru minimal 6 karakter",
      confirmNewPassword: (value, values) =>
        value === values.newPassword ? null : "Password baru tidak cocok",
    },
  });

  const handleChangePassword = async (values: typeof form.values) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("currentPassword", values.currentPassword);
    formData.append("newPassword", values.newPassword);
    formData.append("confirmNewPassword", values.confirmNewPassword);

    const result = await changePassword(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Password berhasil diubah",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      form.reset();
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal mengubah password",
        color: "red",
        icon: <IconX size={16} />,
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Title order={2} mb="lg">
        Pengaturan
      </Title>
      <Stack gap="md">
        {/* Change Password Section */}
        <Paper p="md" radius="md" withBorder>
          <Group gap="xs" mb="md">
            <IconLock size={20} />
            <Text fw={500}>Ubah Password</Text>
          </Group>
          <form onSubmit={form.onSubmit(handleChangePassword)}>
            <Stack gap="sm">
              <PasswordInput
                label="Password Lama"
                placeholder="Masukkan password lama"
                {...form.getInputProps("currentPassword")}
              />
              <PasswordInput
                label="Password Baru"
                placeholder="Masukkan password baru"
                {...form.getInputProps("newPassword")}
              />
              <PasswordInput
                label="Konfirmasi Password Baru"
                placeholder="Masukkan ulang password baru"
                {...form.getInputProps("confirmNewPassword")}
              />
              <Button type="submit" loading={loading} mt="xs">
                Ubah Password
              </Button>
            </Stack>
          </form>
        </Paper>

        <Divider />

        {/* <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Notifikasi</Text>
              <Text size="sm" c="dimmed">
                Aktifkan notifikasi untuk pengingat
              </Text>
            </div>
            <Switch defaultChecked />
          </Group>
        </Paper> */}

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Mata Uang</Text>
              <Text size="sm" c="dimmed">
                IDR - Indonesian Rupiah
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500}>Versi Aplikasi</Text>
              <Text size="sm" c="dimmed">
                v0.1.0
              </Text>
            </div>
          </Group>
        </Paper>
      </Stack>
    </>
  );
}
