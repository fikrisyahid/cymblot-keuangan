'use client';

import { useState } from 'react';
import { BUTTON_BASE_COLOR } from '@/config/color';
import { Button, Input, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import { Pocket } from '@prisma/client';
import { addPocket } from '../actions/db/pocket';

export default function AddPocketForm({
  pockets,
  email,
}: {
  pockets: Pocket[];
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = () => {
    const { name } = formData;

    if (!name) {
      notifications.show({
        title: 'Error',
        message: `Nama kantong tidak boleh kosong`,
        color: 'red',
      });
      return;
    }

    if (pockets.some((pocket) => pocket.name === name)) {
      notifications.show({
        title: 'Error',
        message: `Kantong "${name}" sudah ada`,
        color: 'red',
      });
      return;
    }

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Text>
          Apakah Anda yakin ingin menambahkan kantong <b>{name}</b> ?
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Tambah', cancel: 'Batal' },
      onConfirm: async () => {
        setLoading(true);
        try {
          await addPocket({ email, name });
          setFormData({ name: '' });
          notifications.show({
            title: 'Sukses',
            message: `Kantong "${name}" berhasil ditambahkan`,
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menambahkan kantong',
            color: 'red',
          });
        }
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Input
        name="name"
        placeholder="Nama kantong baru"
        value={formData.name}
        onChange={(e) => setFormData({ name: e.currentTarget.value })}
      />
      <Button
        loading={loading}
        leftSection={<IconPlus />}
        color={BUTTON_BASE_COLOR}
        onClick={handleSubmit}
      >
        Tambah Kantong
      </Button>
    </div>
  );
}
