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
  Textarea,
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
    value: '',
    categoryId: '',
    pocketId: '',
    pocketSourceId: '',
    pocketDestinationId: '',
  });

  const handleChange = (newKeyValue: any) => {
    setFormData((prev) => ({ ...prev, ...newKeyValue }));
  };

  const handleSubmit = () => {
    const {
      date,
      information,
      type,
      value,
      categoryId,
      pocketId,
      pocketSourceId,
      pocketDestinationId,
    } = formData;

    const pocketMustBeFilled =
      type === 'TRANSFER' ? pocketSourceId && pocketDestinationId : pocketId;

    if (
      !date ||
      !information ||
      !type ||
      !value ||
      !categoryId ||
      !pocketMustBeFilled
    ) {
      notifications.show({
        title: 'Error',
        message: 'Masih ada data yang belum diisi',
        color: 'red',
      });
      return;
    }

    if (type === 'TRANSFER' && pocketSourceId === pocketDestinationId) {
      notifications.show({
        title: 'Error',
        message: 'Kantong asal dan kantong tujuan tidak boleh sama',
        color: 'red',
      });
      return;
    }

    const pocketData =
      type !== 'TRANSFER'
        ? {
            pocketId,
          }
        : {
            pocketSourceId,
            pocketDestinationId,
          };

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
            value: parseInt(value, 10),
            categoryId,
            ...pocketData,
          });
          setFormData({
            date: new Date(),
            information: '',
            type: 'PEMASUKAN',
            value: '',
            categoryId: '',
            pocketId: '',
            pocketSourceId: '',
            pocketDestinationId: '',
          });
          notifications.show({
            title: 'Sukses',
            message: `Data keuangan berhasil ditambahkan`,
            color: 'green',
          });
          router.push('/detail');
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal menambahkan data keuangan',
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
      <Textarea
        required
        autosize
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
            <Text c="white">
              Anda belum memiliki kategori. Silakan tambahkan kategori terlebih
              dahulu
            </Text>
            <Button component={Link} href="/category" color="teal">
              Tambah Kategori
            </Button>
          </Stack>
        </Alert>
      )}
      {pockets.length === 0 ? (
        <Alert
          variant="filled"
          color="indigo"
          title="Info"
          icon={<IconInfoCircle />}
          p="xs"
        >
          <Stack align="start">
            <Text c="white">
              Anda belum memiliki kantong. Silakan tambahkan kantong terlebih
              dahulu
            </Text>
            <Button component={Link} href="/pocket" color="teal">
              Tambah Kantong
            </Button>
          </Stack>
        </Alert>
      ) : formData.type !== 'TRANSFER' ? (
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
        <>
          <Select
            required
            label="Kantong Asal"
            placeholder="Pilih kantong asal"
            data={pockets.map((pocket) => ({
              value: pocket.id,
              label: pocket.name,
            }))}
            value={formData.pocketSourceId}
            onChange={(pocketId) => handleChange({ pocketSourceId: pocketId })}
          />
          <Select
            required
            label="Kantong Tujuan"
            placeholder="Pilih kantong tujuan"
            data={pockets.map((pocket) => ({
              value: pocket.id,
              label: pocket.name,
            }))}
            value={formData.pocketDestinationId}
            onChange={(pocketId) =>
              handleChange({ pocketDestinationId: pocketId })
            }
          />
        </>
      )}
      <Button
        loading={loading}
        leftSection={<IconPlus />}
        color={BUTTON_BASE_COLOR}
        disabled={submitButtonDisabled}
        onClick={handleSubmit}
      >
        Tambah data keuangan
      </Button>
    </Stack>
  );
}
