"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
  SegmentedControl,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import {
  createTransaction,
  updateTransaction,
  TransactionFormData,
  TransactionType,
} from "@/app/actions/transactions";
import type { Account, Category, Transaction } from "@/db/schema";

interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  transaction?: (Transaction & {
    account: Account;
    category: Category | null;
  }) | null;
}

function TransactionForm({
  transaction,
  accounts,
  categories,
  onClose,
}: {
  transaction: TransactionModalProps["transaction"];
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>(
    transaction?.type || "EXPENSE"
  );
  const isEdit = !!transaction;

  const form = useForm({
    initialValues: {
      accountId: transaction?.accountId || "",
      categoryId: transaction?.categoryId || "",
      amount: transaction?.amount || "",
      description: transaction?.description || "",
      note: transaction?.note || "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
    validate: {
      accountId: (value) => (!value ? "Pilih akun" : null),
      amount: (value) =>
        !value || parseFloat(String(value)) <= 0 ? "Masukkan nominal" : null,
      description: (value) => (!value ? "Deskripsi harus diisi" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const formData: TransactionFormData = {
      ...values,
      amount: String(values.amount),
      type,
      date: values.date,
    };

    const result = isEdit
      ? await updateTransaction(
        transaction.id,
        formData,
        transaction.amount,
        transaction.type,
        transaction.accountId
      )
      : await createTransaction(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: isEdit
          ? "Transaksi berhasil diupdate"
          : "Transaksi berhasil ditambahkan",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      handleClose();
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Terjadi kesalahan",
        color: "red",
        icon: <IconX size={18} />,
      });
    }

    setLoading(false);
  };

  const filteredCategories = categories.filter((c) => c.type === type);
  const accountOptions = accounts
    .filter((a) => a.isActive)
    .map((a) => ({
      value: a.id,
      label: `${a.icon || "💰"} ${a.name}`,
    }));
  const categoryOptions = filteredCategories.map((c) => ({
    value: c.id,
    label: `${c.icon || "📁"} ${c.name}`,
  }));

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            value={type}
            onChange={(v) => {
              setType(v as TransactionType);
              form.setFieldValue("categoryId", "");
            }}
            data={[
              {
                value: "EXPENSE",
                label: (
                  <Group gap={4} justify="center">
                    <IconArrowDown size={16} />
                    Pengeluaran
                  </Group>
                ),
              },
              {
                value: "INCOME",
                label: (
                  <Group gap={4} justify="center">
                    <IconArrowUp size={16} />
                    Pemasukan
                  </Group>
                ),
              },
            ]}
            fullWidth
            color={type === "INCOME" ? "green" : "red"}
          />

          <NumberInput
            label="Nominal"
            placeholder="0"
            thousandSeparator=","
            prefix="Rp "
            min={0}
            required
            size="lg"
            value={form.values.amount}
            onChange={(value) => {
              // Normalize value to remove leading zeros
              const numValue = typeof value === 'number' ? value : parseFloat(value || '0');
              form.setFieldValue('amount', isNaN(numValue) ? '' : numValue.toString());
            }}
            error={form.errors.amount}
          />

          <Select
            label="Akun"
            placeholder="Pilih akun"
            data={accountOptions}
            required
            searchable
            {...form.getInputProps("accountId")}
          />

          <Select
            label="Kategori"
            placeholder="Pilih kategori (opsional)"
            data={categoryOptions}
            searchable
            clearable
            {...form.getInputProps("categoryId")}
          />

          <TextInput
            label="Deskripsi"
            placeholder="Contoh: Makan siang, Gaji bulanan"
            required
            {...form.getInputProps("description")}
          />

          <DatePickerInput
            label="Tanggal"
            placeholder="Pilih tanggal"
            required
            {...form.getInputProps("date")}
          />

          <Textarea
            label="Catatan"
            placeholder="Catatan tambahan (opsional)"
            autosize
            minRows={2}
            {...form.getInputProps("note")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={loading}
              color={type === "INCOME" ? "green" : "red"}
            >
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}

export function TransactionModal({
  opened,
  onClose,
  accounts,
  categories,
  transaction,
}: TransactionModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={transaction ? "Edit Transaksi" : "Tambah Transaksi"}
      centered
      size="md"
    >
      <TransactionForm
        key={transaction?.id || "new"}
        transaction={transaction}
        accounts={accounts}
        categories={categories}
        onClose={onClose}
      />
    </Modal>
  );
}
