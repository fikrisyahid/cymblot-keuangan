"use client";

import { useState } from "react";
import {
  Modal,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createBudget, updateBudget, type BudgetFormData } from "@/app/actions/budgets";
import type { Category } from "@/db/schema";

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

interface BudgetModalProps {
  opened: boolean;
  onClose: () => void;
  categories: Category[];
  budget?: {
    id: string;
    categoryId: string;
    amount: string;
    month: number;
    year: number;
  } | null;
}

export function BudgetModal({ opened, onClose, categories, budget }: BudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!budget;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const expenseCategories = categories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({
      value: c.id,
      label: `${c.icon || "📁"} ${c.name}`,
    }));

  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];

  const form = useForm({
    initialValues: {
      categoryId: budget?.categoryId || "",
      amount: budget?.amount ? parseFloat(budget.amount) : 0,
      month: budget?.month ? String(budget.month) : String(currentMonth),
      year: budget?.year ? String(budget.year) : String(currentYear),
    },
    validate: {
      categoryId: (value) => (!value ? "Pilih kategori" : null),
      amount: (value) => (value <= 0 ? "Masukkan nominal" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const formData: BudgetFormData = {
      categoryId: values.categoryId,
      amount: String(values.amount),
      month: parseInt(values.month),
      year: parseInt(values.year),
    };

    const result = isEdit
      ? await updateBudget(budget.id, formData)
      : await createBudget(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: isEdit ? "Budget berhasil diupdate" : "Budget berhasil ditambahkan",
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEdit ? "Edit Budget" : "Tambah Budget Baru"}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Kategori Pengeluaran"
            placeholder="Pilih kategori"
            data={expenseCategories}
            required
            searchable
            {...form.getInputProps("categoryId")}
          />

          <NumberInput
            label="Batas Anggaran"
            placeholder="0"
            thousandSeparator=","
            prefix="Rp "
            min={0}
            required
            {...form.getInputProps("amount")}
          />

          <Group grow>
            <Select
              label="Bulan"
              data={MONTHS}
              required
              {...form.getInputProps("month")}
            />

            <Select
              label="Tahun"
              data={yearOptions}
              required
              {...form.getInputProps("year")}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
