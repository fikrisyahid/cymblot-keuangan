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
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import {
  createRecurring,
  RecurringFrequency,
  type RecurringFormData,
} from "@/app/actions/recurring";
import type { Account, Category } from "@/db/schema";

const FREQUENCIES = [
  { value: "DAILY", label: "Harian" },
  { value: "WEEKLY", label: "Mingguan" },
  { value: "MONTHLY", label: "Bulanan" },
  { value: "YEARLY", label: "Tahunan" },
];

interface RecurringModalProps {
  opened: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
}

export function RecurringModal({
  opened,
  onClose,
  accounts,
  categories,
}: RecurringModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  const form = useForm({
    initialValues: {
      accountId: "",
      categoryId: "",
      amount: 0,
      description: "",
      frequency: "MONTHLY" as RecurringFrequency,
      startDate: new Date(),
      nextDueDate: new Date(),
    },
    validate: {
      accountId: (value) => (!value ? "Pilih akun" : null),
      amount: (value) => (value <= 0 ? "Masukkan nominal" : null),
      description: (value) => (!value ? "Deskripsi harus diisi" : null),
      startDate: (value) => (!value ? "Pilih tanggal mulai" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    setType("EXPENSE");
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const formData: RecurringFormData = {
      ...values,
      type,
      amount: String(values.amount),
    };

    const result = await createRecurring(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Transaksi berulang berhasil ditambahkan",
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
      title="Tambah Transaksi Berulang"
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            value={type}
            onChange={(v) => {
              setType(v as "INCOME" | "EXPENSE");
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
            placeholder="Contoh: Langganan Netflix, Gaji Bulanan"
            required
            {...form.getInputProps("description")}
          />

          <Select
            label="Frekuensi"
            data={FREQUENCIES}
            required
            {...form.getInputProps("frequency")}
          />

          <DatePickerInput
            label="Tanggal Mulai"
            placeholder="Pilih tanggal mulai"
            required
            {...form.getInputProps("startDate")}
          />

          <DatePickerInput
            label="Tanggal Berikutnya"
            placeholder="Pilih tanggal berikutnya"
            required
            {...form.getInputProps("nextDueDate")}
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
              Tambah
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
