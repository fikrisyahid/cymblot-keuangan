'use client';

import { useState } from 'react';
import { ActionIcon, Alert, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { deleteCategory } from '../actions/db/category';

export default function DeleteCategoryForm({
  selectedCategory,
}: {
  selectedCategory: any;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    const { id, name: selectedCategoryName } = selectedCategory;

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Text>
            Kategori saat ini: <strong>{selectedCategoryName}</strong>
          </Text>
          <Alert
            variant="filled"
            color="red"
            radius="md"
            title="Berbahaya"
            icon={<IconInfoCircle />}
          >
            Semua data keuangan yang memiliki kategori{' '}
            <b>{selectedCategoryName}</b> juga akan ikut terhapus
          </Alert>
          <Text>Apakah Anda yakin ingin menghapus kategori ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteCategory({ id });
          notifications.show({
            title: 'Sukses',
            message: `Kategori berhasil dihapus`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menghapus kategori',
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
      color="red"
      onClick={handleSubmit}
    >
      <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
    </ActionIcon>
  );
}
