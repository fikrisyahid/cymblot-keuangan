"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
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
  createCategory,
  updateCategory,
  CategoryFormData,
  CategoryType,
} from "@/app/actions/categories";

const CATEGORY_TYPES = [
  { value: "INCOME", label: "📈 Pemasukan" },
  { value: "EXPENSE", label: "📉 Pengeluaran" },
];

const CATEGORY_ICONS = [
  { value: "💰", label: "💰 Uang" },
  { value: "💵", label: "💵 Gaji" },
  { value: "🍔", label: "🍔 Makanan" },
  { value: "🚗", label: "🚗 Transport" },
  { value: "🛒", label: "🛒 Belanja" },
  { value: "💡", label: "💡 Tagihan" },
  { value: "🎮", label: "🎮 Hiburan" },
  { value: "🏥", label: "🏥 Kesehatan" },
  { value: "📚", label: "📚 Pendidikan" },
  { value: "🏠", label: "🏠 Rumah" },
  { value: "🎁", label: "🎁 Hadiah" },
  { value: "📈", label: "📈 Investasi" },
  { value: "💼", label: "💼 Bisnis" },
  { value: "✈️", label: "✈️ Travel" },
  { value: "👗", label: "👗 Fashion" },
  { value: "💄", label: "💄 Beauty" },
];

interface CategoryModalProps {
  opened: boolean;
  onClose: () => void;
  category?: {
    id: string;
    name: string;
    type: CategoryType;
    icon: string | null;
    color: string | null;
    isDefault: boolean;
  } | null;
}

export function CategoryModal({ opened, onClose, category }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const form = useForm<CategoryFormData>({
    initialValues: {
      name: category?.name || "",
      type: category?.type || "EXPENSE",
      icon: category?.icon || "💰",
      color: category?.color || "#228be6",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Nama kategori harus diisi" : null),
    },
  });

  // Sync form values when modal opens or category changes
  useEffect(() => {
    if (opened) {
      form.setValues({
        name: category?.name || "",
        type: category?.type || "EXPENSE",
        icon: category?.icon || "💰",
        color: category?.color || "#228be6",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, category]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: CategoryFormData) => {
    setLoading(true);

    const result = isEdit
      ? await updateCategory(category.id, values)
      : await createCategory(values);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: isEdit ? "Kategori berhasil diupdate" : "Kategori berhasil ditambahkan",
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
      title={isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nama Kategori"
            placeholder="Contoh: Jajan, Belanja Online"
            required
            {...form.getInputProps("name")}
          />

          <Select
            label="Tipe"
            data={CATEGORY_TYPES}
            required
            disabled={isEdit && category?.isDefault}
            {...form.getInputProps("type")}
          />

          <Select
            label="Icon"
            data={CATEGORY_ICONS}
            searchable
            {...form.getInputProps("icon")}
          />

          <ColorInput
            label="Warna"
            format="hex"
            swatches={[
              "#ef4444",
              "#f97316",
              "#eab308",
              "#22c55e",
              "#06b6d4",
              "#3b82f6",
              "#8b5cf6",
              "#ec4899",
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
