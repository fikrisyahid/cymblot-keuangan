'use client';

import { useRef, useState } from 'react';
import { ActionIcon, Input, Stack, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { editPocket } from '../actions/db/pocket';

export default function EditPocketForm({
  pockets,
  selectedPocket,
}: {
  pockets: any[];
  selectedPocket: any;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const { id, name: selectedPocketName } = selectedPocket;

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Text>
            Ubah kantong <strong>{selectedPocketName}</strong> menjadi:
          </Text>
          <Input placeholder="Masukkan nama kantong baru" ref={inputRef} />
          <Text>Apakah Anda yakin ingin merubah kantong ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Ubah', cancel: 'Batal' },
      confirmProps: { color: 'yellow' },
      onConfirm: async () => {
        setLoading(true);

        const newPocketName = inputRef.current?.value;

        try {
          if (!newPocketName) {
            throw new Error('Nama kantong tidak boleh kosong');
          }
          if (newPocketName === selectedPocketName) {
            throw new Error('Nama kantong tidak berubah');
          }
          if (
            pockets.some(
              (pocket) =>
                pocket.name === newPocketName &&
                newPocketName !== selectedPocketName,
            )
          ) {
            throw new Error('Nama kantong sudah ada');
          }
          await editPocket({ id, name: newPocketName });
          notifications.show({
            title: 'Sukses',
            message: `Kantong berhasil diubah`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal merubah kantong',
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
