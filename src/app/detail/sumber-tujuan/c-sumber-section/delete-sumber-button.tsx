"use client";

import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { deleteSumber } from "@/app/actions/sumber";

export default function DeleteSumberButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  function handleDelete() {
    openConfirmModal({
      title: "Konfirmasi Penghapusan",
      children: (
        <>
          <Text>Apakah Anda yakin ingin menghapus sumber ini?</Text>
          <br />
          <Text fw={700}>
            Seluruh data keuangan yang terkait dengan sumber ini akan dihapus.
          </Text>
        </>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteSumber(id);
          notifications.show({
            title: "Sukses",
            message: "Sumber berhasil dihapus",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Gagal menghapus sumber",
            color: "red",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  }

  return (
    <ActionIcon
      variant="filled"
      aria-label="Delete"
      onClick={handleDelete}
      disabled={loading}
      color="red"
    >
      <IconTrash />
    </ActionIcon>
  );
}
