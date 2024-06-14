"use client";

import { useState, useRef } from "react";
import { ActionIcon, Flex, Input, Loader, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import stringCapitalize from "@/utils/string-capitalize";

export default function AddForm({
  type,
  addFunction,
}: {
  type: "sumber" | "tujuan";
  addFunction: ({ formData }: { formData: FormData }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nama = inputRef.current?.value;
    if (nama) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: <Text>Apakah Anda yakin ingin menambahkan {type} ini?</Text>,
        labels: { confirm: "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          setLoading(true);
          const formData = new FormData();
          formData.set(type, nama);

          try {
            addFunction({ formData });
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            notifications.show({
              title: "Sukses",
              message: `${stringCapitalize(type)} berhasil ditambahkan`,
              color: "green",
            });
          } catch (error) {
            notifications.show({
              title: "Error",
              message: `Gagal menambahkan ${type}`,
              color: "red",
            });
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      notifications.show({
        title: "Error",
        message: `Nama ${type} tidak boleh kosong`,
        color: "red",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex gap="sm" align="center">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tambahkan sumber baru"
          style={{ width: "100%" }}
          disabled={loading}
        />
        <ActionIcon
          variant="filled"
          aria-label="Settings"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader size="xs" /> : <IconPlus />}
        </ActionIcon>
      </Flex>
    </form>
  );
}
