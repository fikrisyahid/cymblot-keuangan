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
  Textarea,
  Paper,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconArrowsExchange,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  createTransaction,
  updateTransaction,
  TransactionFormData,
  TransactionType,
} from "@/app/actions/transactions";
import {
  createTransfer,
  updateTransfer,
  TransferFormData,
} from "@/app/actions/transfers";
import type { Account, Category, Transaction, Transfer } from "@/db/schema";

export type TransactionWithRelations = Transaction & {
  account: Account;
  category: Category | null;
};

export type TransferWithRelations = Transfer & {
  fromAccount: Account;
  toAccount: Account;
};

type ModalMode = "EXPENSE" | "INCOME" | "TRANSFER";

interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  transaction?: TransactionWithRelations | null;
  transfer?: TransferWithRelations | null;
}

function TransactionForm({
  transaction,
  transfer,
  accounts,
  categories,
  onClose,
}: {
  transaction: TransactionWithRelations | null | undefined;
  transfer: TransferWithRelations | null | undefined;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const getInitialMode = (): ModalMode => {
    if (transfer) return "TRANSFER";
    if (transaction?.type === "INCOME") return "INCOME";
    return "EXPENSE";
  };

  const [mode, setMode] = useState<ModalMode>(getInitialMode());

  const isEdit = !!(transaction || transfer);
  const isTransferMode = mode === "TRANSFER";

  const form = useForm({
    initialValues: {
      // Common
      amount: transaction?.amount || transfer?.amount || "",
      description: transaction?.description || transfer?.description || "",
      note: transaction?.note || transfer?.note || "",
      date: transaction?.date
        ? new Date(transaction.date)
        : transfer?.date
          ? new Date(transfer.date)
          : new Date(),
      // Transaction-specific
      accountId: transaction?.accountId || "",
      categoryId: transaction?.categoryId || "",
      // Transfer-specific
      fromAccountId: transfer?.fromAccountId || "",
      toAccountId: transfer?.toAccountId || "",
      fee: transfer?.fee || "0",
    },
    validate: {
      amount: (value) =>
        !value || parseFloat(String(value)) <= 0
          ? "Masukkan nominal"
          : null,
      description: (value) => (!value ? "Deskripsi harus diisi" : null),
      accountId: (value) =>
        !isTransferMode && !value ? "Pilih akun" : null,
      fromAccountId: (value) =>
        isTransferMode && !value ? "Pilih akun asal" : null,
      toAccountId: (value, values) => {
        if (!isTransferMode) return null;
        if (!value) return "Pilih akun tujuan";
        if (value === values.fromAccountId)
          return "Akun tujuan harus berbeda";
        return null;
      },
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      if (isTransferMode) {
        const transferData: TransferFormData = {
          fromAccountId: values.fromAccountId,
          toAccountId: values.toAccountId,
          amount: String(values.amount),
          fee: String(values.fee || "0"),
          description: values.description,
          note: values.note || undefined,
          date: values.date,
        };

        const result = transfer
          ? await updateTransfer(
              transfer.id,
              transferData,
              transfer.amount,
              transfer.fee,
              transfer.fromAccountId,
              transfer.toAccountId,
            )
          : await createTransfer(transferData);

        if (result.success) {
          notifications.show({
            title: "Berhasil",
            message: transfer
              ? "Transfer berhasil diupdate"
              : "Transfer berhasil dilakukan",
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
      } else {
        const txType: TransactionType = mode as TransactionType;
        const formData: TransactionFormData = {
          accountId: values.accountId,
          categoryId: values.categoryId || undefined,
          amount: String(values.amount),
          type: txType,
          description: values.description,
          note: values.note || undefined,
          date: values.date,
        };

        const result = transaction
          ? await updateTransaction(
              transaction.id,
              formData,
              transaction.amount,
              transaction.type,
              transaction.accountId,
            )
          : await createTransaction(formData);

        if (result.success) {
          notifications.show({
            title: "Berhasil",
            message: transaction
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
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === (mode === "INCOME" ? "INCOME" : "EXPENSE"),
  );
  const activeAccounts = accounts.filter((a) => a.isActive);
  const accountOptions = activeAccounts.map((a) => ({
    value: a.id,
    label: `${a.icon || "💰"} ${a.name}`,
  }));
  const categoryOptions = filteredCategories.map((c) => ({
    value: c.id,
    label: `${c.icon || "📁"} ${c.name}`,
  }));
  const toAccountOptions = activeAccounts
    .filter((a) => a.id !== form.values.fromAccountId)
    .map((a) => ({
      value: a.id,
      label: `${a.icon || "💰"} ${a.name}`,
    }));

  const fromAccount = activeAccounts.find(
    (a) => a.id === form.values.fromAccountId,
  );
  const toAccount = activeAccounts.find(
    (a) => a.id === form.values.toAccountId,
  );

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const buttonColor =
    mode === "INCOME" ? "green" : mode === "EXPENSE" ? "red" : "blue";

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Stack gap="xs">
          {(
            [
              { value: "EXPENSE", label: "Pengeluaran", icon: <IconArrowDown size={16} />, color: "red" },
              { value: "INCOME", label: "Pemasukan", icon: <IconArrowUp size={16} />, color: "green" },
              { value: "TRANSFER", label: "Transfer", icon: <IconArrowsExchange size={16} />, color: "blue" },
            ] as const
          ).map(({ value, label, icon, color }) => (
            <Button
              key={value}
              variant={mode === value ? "filled" : "light"}
              color={color}
              leftSection={icon}
              fullWidth
              disabled={isEdit && mode !== value}
              onClick={() => {
                if (!isEdit) {
                  setMode(value);
                  form.setFieldValue("categoryId", "");
                }
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        {isTransferMode && fromAccount && toAccount && (
          <Paper
            p="sm"
            radius="md"
            withBorder
            bg="var(--mantine-color-blue-light)"
          >
            <Group justify="center" gap="xs">
              <Text size="sm" fw={600}>
                {fromAccount.icon || "💰"} {fromAccount.name}
              </Text>
              <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
                <IconArrowRight size={14} />
              </ThemeIcon>
              <Text size="sm" fw={600}>
                {toAccount.icon || "💰"} {toAccount.name}
              </Text>
            </Group>
            <Group justify="center" gap="lg" mt={4}>
              <Text size="xs" c="dimmed">
                Saldo: {formatCurrency(fromAccount.balance)}
              </Text>
              <Text size="xs" c="dimmed">
                Saldo: {formatCurrency(toAccount.balance)}
              </Text>
            </Group>
          </Paper>
        )}

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
            const numValue =
              typeof value === "number"
                ? value
                : parseFloat(value || "0");
            form.setFieldValue(
              "amount",
              isNaN(numValue) ? "" : numValue.toString(),
            );
          }}
          error={form.errors.amount}
        />

        {!isTransferMode && (
          <>
            <Select
              label="Akun"
              placeholder="Pilih akun"
              data={accountOptions}
              required
              {...form.getInputProps("accountId")}
            />

            <Select
              label="Kategori"
              placeholder="Pilih kategori (opsional)"
              data={categoryOptions}
              clearable
              {...form.getInputProps("categoryId")}
            />
          </>
        )}

        {isTransferMode && (
          <>
            <Select
              label="Akun Asal"
              placeholder="Pilih akun asal"
              data={accountOptions}
              required
              {...form.getInputProps("fromAccountId")}
              onChange={(val) => {
                form.setFieldValue("fromAccountId", val || "");
                if (val === form.values.toAccountId) {
                  form.setFieldValue("toAccountId", "");
                }
              }}
            />

            <Select
              label="Akun Tujuan"
              placeholder="Pilih akun tujuan"
              data={toAccountOptions}
              required
              {...form.getInputProps("toAccountId")}
            />

            <NumberInput
              label="Biaya Transfer (opsional)"
              description="Biaya admin / transfer yang dikenakan"
              placeholder="0"
              thousandSeparator=","
              prefix="Rp "
              min={0}
              value={form.values.fee}
              onChange={(value) => {
                const numValue =
                  typeof value === "number"
                    ? value
                    : parseFloat(value || "0");
                form.setFieldValue(
                  "fee",
                  isNaN(numValue) ? "0" : numValue.toString(),
                );
              }}
            />
          </>
        )}

        <TextInput
          label="Deskripsi"
          placeholder={
            isTransferMode
              ? "Contoh: Tarik tunai ATM, Top up DANA"
              : "Contoh: Makan siang, Gaji bulanan"
          }
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
          <Button type="submit" loading={loading} color={buttonColor}>
            {isEdit ? "Simpan" : isTransferMode ? "Transfer" : "Tambah"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function TransactionModal({
  opened,
  onClose,
  accounts,
  categories,
  transaction,
  transfer,
}: TransactionModalProps) {
  const getTitle = () => {
    if (transfer) return "Edit Transfer";
    if (transaction) return "Edit Transaksi";
    return "Tambah Transaksi";
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={getTitle()}
      centered
      size="md"
    >
      <TransactionForm
        key={transaction?.id || transfer?.id || "new"}
        transaction={transaction}
        transfer={transfer}
        accounts={accounts}
        categories={categories}
        onClose={onClose}
      />
    </Modal>
  );
}
