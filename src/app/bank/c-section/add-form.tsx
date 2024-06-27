"use client";

import { useState, useRef } from "react";
import { ActionIcon, Flex, Input, Loader, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { ITujuanSumber } from "@/types/db";

export default function AddForm({
  addFunction,
  data,
}: {
  addFunction: ({ formData }: { formData: FormData }) => Promise<void>;
  data: ITujuanSumber[];
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nama = inputRef.current?.value;
    if (nama) {
      const existingData = data.filter(
        (item) => item.nama.toLowerCase() === nama.toLowerCase()
      );
      const alreadyExists = existingData.length > 0;

      if (alreadyExists) {
        notifications.show({
          title: "Error",
          message: `Bank sudah ada`,
          color: "red",
        });
        setLoading(false);
        return;
      }

      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: <Text>Apakah Anda yakin ingin menambahkan bank ini?</Text>,
        labels: { confirm: "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          setLoading(true);
          const formData = new FormData();
          formData.set("bank", nama);

          try {
            addFunction({ formData });
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            notifications.show({
              title: "Sukses",
              message: `Bank berhasil ditambahkan`,
              color: "green",
            });
          } catch (error) {
            notifications.show({
              title: "Error",
              message: `Gagal menambahkan bank`,
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
        message: `Nama bank tidak boleh kosong`,
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
          placeholder="Tambahkan bank baru"
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
