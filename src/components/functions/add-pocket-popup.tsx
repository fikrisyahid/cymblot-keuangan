'use client';

import { useRef, useState } from 'react';
import { Button, Input, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { addPocket } from '@/app/actions/db/pocket';
import { Pocket } from '@prisma/client';

export default function AddPocketPopup({
  email,
  pockets,
  className,
}: {
  email: string;
  pockets: Pocket[];
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Stack>
          <Input placeholder="Masukkan nama kantong baru" ref={inputRef} />
          <Text>Apakah Anda yakin ingin menambah kantong ini?</Text>
        </Stack>
      ),
      centered: true,
      labels: { confirm: 'Tambah', cancel: 'Batal' },
      onConfirm: async () => {
        setLoading(true);

        const newPocketName = inputRef.current?.value;

        try {
          if (!newPocketName) {
            throw new Error('Nama kantong tidak boleh kosong');
          }
          if (pockets.some((pocket) => pocket.name === newPocketName)) {
            throw new Error('Nama kantong sudah ada');
          }
          await addPocket({ email, name: newPocketName });
          notifications.show({
            title: 'Sukses',
            message: `Kantong berhasil ditambahkan`,
            color: 'green',
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal menambahkan kantong',
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
      color="teal"
    >
      Tambah Kantong
    </Button>
  );
}
