'use client';

import { useState } from 'react';
import { ActionIcon, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { deletePocket } from '../actions/db/pocket';

export default function DeletePocketForm({
  selectedPocket,
}: {
  selectedPocket: any;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    const { id, name: selectedPocketName } = selectedPocket;

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Text>
            Kantong saat ini: <strong>{selectedPocketName}</strong>
          </Text>
          <Text>Apakah Anda yakin ingin menghapus kantong ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);

        try {
          await deletePocket({ id });
          notifications.show({
            title: 'Sukses',
            message: `Kantong berhasil dihapus`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menghapus kantong',
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
