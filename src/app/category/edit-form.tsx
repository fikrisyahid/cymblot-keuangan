'use client';

import { useRef, useState } from 'react';
import { ActionIcon, Input, Stack, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import editCategory from '../actions/edit-category';

export default function EditCategoryForm({
  categories,
  selectedCategory,
}: {
  categories: any[];
  selectedCategory: any;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const { id, name: selectedCategoryName } = selectedCategory;

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Text>
            Ubah kategori <strong>{selectedCategoryName}</strong> menjadi:
          </Text>
          <Input placeholder="Masukkan nama kategori baru" ref={inputRef} />
          <Text>Apakah Anda yakin ingin merubah kategori ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Ubah', cancel: 'Batal' },
      confirmProps: { color: 'yellow' },
      onConfirm: async () => {
        setLoading(true);

        const newCategoryName = inputRef.current?.value;

        try {
          if (!newCategoryName) {
            throw new Error('Nama kategori tidak boleh kosong');
          }
          if (newCategoryName === selectedCategoryName) {
            throw new Error('Nama kategori tidak berubah');
          }
          if (
            categories.some(
              (category) =>
                category.name === newCategoryName &&
                newCategoryName !== selectedCategoryName,
            )
          ) {
            throw new Error('Nama kategori sudah ada');
          }
          await editCategory({ id, name: newCategoryName });
          notifications.show({
            title: 'Sukses',
            message: `Kategori berhasil diubah`,
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
    <ActionIcon
      variant="filled"
      loading={loading}
      color="yellow"
      onClick={handleSubmit}
    >
      <IconPencil style={{ width: '70%', height: '70%' }} stroke={1.5} />
    </ActionIcon>
  );
}
