'use client';

import { editTransaction } from '@/app/actions/db/transaction';
import convertTransactionType from '@/utils/convert-transaction-type';
import {
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
import {
  Category,
  Pocket,
  Transaction,
  TRANSACTION_TYPE,
} from '@prisma/client';
import { IconPencil } from '@tabler/icons-react';
import { useRouter } from 'next-nprogress-bar';
import { useState } from 'react';
import AddPocketPopup from '../../components/functions/add-pocket-popup';
import AddCategoryPopup from '../../components/functions/add-category-popup';

export default function EditTransactionForm({
  email,
  transaction,
  categories,
  pockets,
}: {
  email: string;
  transaction: Transaction;
  categories: Category[];
  pockets: Pocket[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: transaction.date || new Date(),
    information: transaction.information || '',
    type: convertTransactionType(transaction.type) || 'PEMASUKAN',
    value: transaction.value || '',
    categoryId: transaction.categoryId || '',
    pocketId: transaction.pocketId || '',
    pocketSourceId: transaction.pocketSourceId || '',
    pocketDestinationId: transaction.pocketDestinationId || '',
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
      confirmProps: { color: 'yellow' },
      centered: true,
      labels: { confirm: 'Ubah', cancel: 'Batal' },
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await editTransaction({
            email,
            id: transaction.id,
            date,
            information,
            type: convertTransactionType(type) as TRANSACTION_TYPE,
            value: parseInt(value as string, 10),
            categoryId,
            ...pocketData,
          });
          notifications.show({
            title: result.success ? 'Sukses' : 'Error',
            message: result.message,
            color: result.success ? 'green' : 'red',
          });
          if (result.success) {
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
            router.push('/detail');
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal merubah data keuangan',
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
        allowDeselect={false}
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
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <Select
          required
          allowDeselect={false}
          className="flex-grow"
          label="Kategori"
          disabled={categories.length === 0}
          placeholder="Pilih kategori"
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          value={formData.categoryId}
          onChange={(categoryId) => handleChange({ categoryId })}
        />
        <AddCategoryPopup email={email} categories={categories} />
      </div>
      {formData.type !== 'TRANSFER' ? (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <Select
            required
            allowDeselect={false}
            className="flex-grow"
            label="Kantong"
            disabled={pockets.length === 0}
            placeholder="Pilih kantong"
            data={pockets.map((pocket) => ({
              value: pocket.id,
              label: pocket.name,
            }))}
            value={formData.pocketId}
            onChange={(pocketId) => handleChange({ pocketId })}
          />
          <AddPocketPopup email={email} pockets={pockets} />
        </div>
      ) : (
        <>
          <AddPocketPopup email={email} pockets={pockets} />
          <Select
            required
            allowDeselect={false}
            label="Kantong Asal"
            disabled={pockets.length === 0}
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
            allowDeselect={false}
            label="Kantong Tujuan"
            disabled={pockets.length === 0}
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
        leftSection={<IconPencil />}
        color="yellow"
        disabled={submitButtonDisabled}
        onClick={handleSubmit}
      >
        Ubah data keuangan
      </Button>
    </Stack>
  );
}
