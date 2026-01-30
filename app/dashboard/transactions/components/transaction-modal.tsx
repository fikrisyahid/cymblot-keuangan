"use client";

import { useState, useEffect } from "react";
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

export function TransactionModal({
  opened,
  onClose,
  accounts,
  categories,
  transaction,
}: TransactionModalProps) {
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

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      if (transaction) {
        setType(transaction.type);
        form.setValues({
          accountId: transaction.accountId,
          categoryId: transaction.categoryId || "",
          amount: transaction.amount,
          description: transaction.description,
          note: transaction.note || "",
          date: new Date(transaction.date),
        });
      } else {
        setType("EXPENSE");
        form.reset();
        form.setFieldValue("date", new Date());
      }
    }
  }, [opened, transaction]);

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
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
      centered
      size="md"
    >
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
            {...form.getInputProps("amount")}
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
    </Modal>
  );
}
