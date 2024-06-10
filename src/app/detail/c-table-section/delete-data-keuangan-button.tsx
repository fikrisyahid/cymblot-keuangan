"use client";

import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { deleteTransaksi } from "@/app/actions/transaksi";

export default function DeleteDataKeuanganButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  function handleDelete() {
    openConfirmModal({
      title: "Konfirmasi Penghapusan",
      children: (
        <Text>Apakah Anda yakin ingin menghapus data keuangan ini?</Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteTransaksi(id);
          notifications.show({
            title: "Sukses",
            message: "Data keuangan berhasil dihapus",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Gagal menghapus data keuangan",
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
