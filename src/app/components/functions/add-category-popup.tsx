'use client';

import { useRef, useState } from 'react';
import { Button, Input, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { addCategory } from '@/app/actions/db/category';
import { BUTTON_BASE_COLOR } from '@/config/color';

export default function AddCategoryPopup({
  email,
  categories,
  className,
}: {
  email: string;
  categories: any[];
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Input placeholder="Masukkan nama kategori baru" ref={inputRef} />
          <Text>Apakah Anda yakin ingin menambah kategori ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Tambah', cancel: 'Batal' },
      onConfirm: async () => {
        setLoading(true);

        const newCategoryName = inputRef.current?.value;

        try {
          if (!newCategoryName) {
            throw new Error('Nama kategori tidak boleh kosong');
          }
          if (
            categories.some((category) => category.name === newCategoryName)
          ) {
            throw new Error('Nama kategori sudah ada');
          }
          await addCategory({ email, name: newCategoryName });
          notifications.show({
            title: 'Sukses',
            message: `Kategori berhasil ditambahkan`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal menambahkan kategori',
            color: 'red',
          });
        }
        setLoading(false);
      },
    });
  };

  return (
    <Button
      leftSection={<IconPlus />}
      onClick={handleSubmit}
      loading={loading}
      className={className}
      color={BUTTON_BASE_COLOR}
    >
      Tambah Kategori
    </Button>
  );
}
