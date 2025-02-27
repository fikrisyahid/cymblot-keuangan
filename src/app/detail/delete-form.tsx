'use client';

import { useState } from 'react';
import { ActionIcon, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { deleteTransaction } from '../actions/db/transaction';

export default function DeleteTransactionForm({
  selectedTransaction,
}: {
  selectedTransaction: any;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    const { id } = selectedTransaction;

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Text>Apakah Anda yakin ingin menghapus transaksi ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteTransaction({ id });
          notifications.show({
            title: 'Sukses',
            message: `Transaksi berhasil dihapus`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menghapus transaksi',
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
