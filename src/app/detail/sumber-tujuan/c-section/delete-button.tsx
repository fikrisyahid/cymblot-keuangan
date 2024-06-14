"use client";

import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import stringCapitalize from "@/utils/string-capitalize";

export default function DeleteButton({
  id,
  type,
  deleteFunction,
}: {
  id: string;
  type: "sumber" | "tujuan";
  deleteFunction: ({ id }: { id: string }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  function handleDelete() {
    openConfirmModal({
      title: "Konfirmasi Penghapusan",
      children: (
        <>
          <Text>Apakah Anda yakin ingin menghapus {type} ini?</Text>
          <br />
          <Text fw={700}>
            Seluruh data keuangan yang terkait dengan {type} ini akan dihapus.
          </Text>
        </>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteFunction({ id });
          notifications.show({
            title: "Sukses",
            message: `${stringCapitalize(type)} berhasil dihapus`,
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: `Gagal menghapus ${type}`,
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
