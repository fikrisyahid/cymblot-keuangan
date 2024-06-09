"use client";

import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";

export default function DeleteTujuanButton({
  id,
  deleteTujuan,
}: {
  id: string;
  deleteTujuan: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  function handleDelete() {
    openConfirmModal({
      title: "Konfirmasi Penghapusan",
      children: (
        <>
          <Text>Apakah Anda yakin ingin menghapus tujuan ini?</Text>
          <br />
          <Text fw={700}>
            Seluruh data keuangan yang terkait dengan tujuan ini akan dihapus.
          </Text>
        </>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteTujuan(id);
          notifications.show({
            title: "Sukses",
            message: "Tujuan berhasil dihapus",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Gagal menghapus tujuan",
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
