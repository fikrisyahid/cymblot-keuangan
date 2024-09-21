'use client';

import { addTransaction } from '@/app/actions/db/transaction';
import { BUTTON_BASE_COLOR } from '@/config/color';
import convertTransactionType from '@/utils/convert-transaction-type';
import {
  Alert,
  Button,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { openConfirmModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Category, Pocket, TRANSACTION_TYPE } from '@prisma/client';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next-nprogress-bar';
import Link from 'next/link';
import { useState } from 'react';

export default function AddTransactionForm({
  email,
  categories,
  pockets,
}: {
  email: string;
  categories: Category[];
  pockets: Pocket[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    information: '',
    type: 'PEMASUKAN',
    value: 0,
    categoryId: '',
    pocketId: '',
  });

  const handleChange = (newKeyValue: any) => {
    setFormData((prev) => ({ ...prev, ...newKeyValue }));
  };

  const handleSubmit = () => {
    const { date, information, type, value, categoryId, pocketId } = formData;

    if (!date || !information || !type || !value || !categoryId || !pocketId) {
      notifications.show({
        title: 'Error',
        message: 'Masih ada data yang belum diisi',
        color: 'red',
      });
      return;
    }

    openConfirmModal({
      title: 'Harap Konfirmasi Terlebih Dahulu',
      children: (
        <Text>Apakah Anda yakin ingin menambahkan data keuangan ini?</Text>
      ),
      centered: true,
      labels: { confirm: 'Tambah', cancel: 'Batal' },
      onConfirm: async () => {
        setLoading(true);
        try {
          await addTransaction({
            email,
            date,
            information,
            type: convertTransactionType(type) as TRANSACTION_TYPE,
            value,
            categoryId,
            pocketId,
          });
          setFormData({
            date: new Date(),
            information: '',
            type: 'PEMASUKAN',
            value: 0,
            categoryId: '',
            pocketId: '',
          });
          notifications.show({
            title: 'Sukses',
            message: `Data keuangan berhasil ditambahkan`,
            color: 'green',
          });
          router.push('/detail');
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menambahkan data keuangan',
            color: 'red',
          });
        }
        setLoading(false);
      },
    });
  };

  const submitButtonDisabled = categories.length === 0 || pockets.length === 0;

  return (
    <Stack gap="sm">
      <DateTimePicker
        required
        label="Tanggal"
        placeholder="Pilih tanggal"
        value={formData.date}
        onChange={(date) => handleChange({ date })}
      />
      <TextInput
        required
        label="Keterangan"
        placeholder="Isi keterangan data keuangan"
        value={formData.information}
        onChange={(event) =>
          handleChange({ information: event.currentTarget.value })
        }
      />
      <Select
        required
        label="Jenis"
        placeholder="Pilih jenis data keuangan"
        data={['PEMASUKAN', 'PENGELUARAN', 'TRANSFER']}
        value={formData.type}
        onChange={(type) => handleChange({ type })}
      />
      <NumberInput
        required
        label="Nominal"
        placeholder="Masukkan nominal"
        prefix="Rp"
        value={formData.value}
        allowNegative={false}
        allowDecimal={false}
        thousandSeparator=","
        onChange={(value) => handleChange({ value })}
      />
      {categories.length > 0 ? (
        <Select
          required
          label="Kategori"
          placeholder="Pilih kategori"
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          value={formData.categoryId}
          onChange={(categoryId) => handleChange({ categoryId })}
        />
      ) : (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
        >
          <Stack align="start">
            <Text>
              Anda belum memiliki kategori. Silakan tambahkan kategori terlebih
              dahulu
            </Text>
            <Button component={Link} href="/category" color="teal">
              Tambah Kategori
            </Button>
          </Stack>
        </Alert>
      )}
      {pockets.length > 0 ? (
        <Select
          required
          label="Kantong"
          placeholder="Pilih kantong"
          data={pockets.map((pocket) => ({
            value: pocket.id,
            label: pocket.name,
          }))}
          value={formData.pocketId}
          onChange={(pocketId) => handleChange({ pocketId })}
        />
      ) : (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
        >
          <Stack align="start">
            <Text>
              Anda belum memiliki kantong. Silakan tambahkan kantong terlebih
              dahulu
            </Text>
            <Button component={Link} href="/pocket" color="teal">
              Tambah Kantong
            </Button>
          </Stack>
        </Alert>
      )}
      <Button
        loading={loading}
        leftSection={<IconPlus />}
        color={BUTTON_BASE_COLOR}
        disabled={submitButtonDisabled}
        onClick={handleSubmit}
      >
        Tambah Data keuangan
      </Button>
    </Stack>
  );
}
