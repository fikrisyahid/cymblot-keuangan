"use client";

import { ActionIcon, Flex, Input, Text } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import stringCapitalize from "@/utils/string-capitalize";

export default function EditButton({
  id,
  nama,
  type,
  editFunction,
}: {
  id: string;
  nama: string;
  type: "sumber" | "tujuan";
  editFunction: ({ id, nama }: { id: string; nama: string }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDelete() {
    openConfirmModal({
      title: "Konfirmasi Pengubahan",
      children: (
        <Flex direction="column" gap="sm">
          <Input
            ref={inputRef}
            placeholder={`Masukkan ${type} baru`}
            defaultValue={nama}
          />
          <Text>Apakah Anda yakin ingin mengubah {type} ini?</Text>
        </Flex>
      ),
      labels: { confirm: "Ubah", cancel: "Batal" },
      confirmProps: { color: "yellow" },
      onConfirm: async () => {
        setLoading(true);
        try {
          const newEditName = inputRef.current?.value;
          if (!newEditName) {
            throw new Error(`${stringCapitalize(type)} tidak boleh kosong`);
          }
          editFunction({
            id,
            nama: newEditName,
          });
          notifications.show({
            title: "Sukses",
            message: `${stringCapitalize(type)} berhasil diubah`,
            color: "green",
          });
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error.message || `Gagal mengubah ${type}`,
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
      color="yellow"
    >
      <IconEdit />
    </ActionIcon>
  );
}
