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
  ColorInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  createAccount,
  updateAccount,
  AccountFormData,
  AccountType,
} from "@/app/actions/accounts";

const ACCOUNT_TYPES = [
  { value: "CASH", label: "💵 Tunai" },
  { value: "BANK", label: "🏦 Bank" },
  { value: "E_WALLET", label: "📱 E-Wallet" },
  { value: "CREDIT_CARD", label: "💳 Kartu Kredit" },
  { value: "INVESTMENT", label: "📈 Investasi" },
];

const ACCOUNT_ICONS = [
  { value: "💵", label: "💵 Uang" },
  { value: "🏦", label: "🏦 Bank" },
  { value: "📱", label: "📱 HP" },
  { value: "💳", label: "💳 Kartu" },
  { value: "📈", label: "📈 Investasi" },
  { value: "💰", label: "💰 Kantong" },
  { value: "🏧", label: "🏧 ATM" },
  { value: "💎", label: "💎 Aset" },
];

interface AccountModalProps {
  opened: boolean;
  onClose: () => void;
  account?: {
    id: string;
    name: string;
    type: AccountType;
    balance: string;
    currency: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export function AccountModal({ opened, onClose, account }: AccountModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!account;

  const form = useForm<AccountFormData>({
    initialValues: {
      name: account?.name || "",
      type: account?.type || "CASH",
      balance: account?.balance || "0",
      currency: account?.currency || "IDR",
      icon: account?.icon || "💵",
      color: account?.color || "#228be6",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Nama akun harus diisi" : null),
    },
  });

  // Reset form when modal opens with different account
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: AccountFormData) => {
    setLoading(true);

    const result = isEdit
      ? await updateAccount(account.id, values)
      : await createAccount(values);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: isEdit ? "Akun berhasil diupdate" : "Akun berhasil ditambahkan",
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
      title={isEdit ? "Edit Akun" : "Tambah Akun Baru"}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nama Akun"
            placeholder="Contoh: BCA, GoPay, Dompet"
            required
            {...form.getInputProps("name")}
          />

          <Select
            label="Tipe Akun"
            data={ACCOUNT_TYPES}
            required
            {...form.getInputProps("type")}
          />

          <NumberInput
            label="Saldo Awal"
            placeholder="0"
            thousandSeparator=","
            prefix="Rp "
            min={0}
            {...form.getInputProps("balance")}
          />

          <Select
            label="Icon"
            data={ACCOUNT_ICONS}
            {...form.getInputProps("icon")}
          />

          <ColorInput
            label="Warna"
            format="hex"
            swatches={[
              "#228be6",
              "#40c057",
              "#fab005",
              "#fa5252",
              "#7950f2",
              "#fd7e14",
              "#20c997",
              "#e64980",
            ]}
            {...form.getInputProps("color")}
          />

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
