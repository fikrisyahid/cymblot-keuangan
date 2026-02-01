"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
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
import { createDebt, type DebtFormData, type DebtType } from "@/app/actions/debts";

interface DebtModalProps {
  opened: boolean;
  onClose: () => void;
}

export function DebtModal({ opened, onClose }: DebtModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<DebtType>("BORROW");

  const form = useForm({
    initialValues: {
      personName: "",
      amount: 0,
      description: "",
      dueDate: null as Date | null,
    },
    validate: {
      personName: (value) => (!value ? "Nama harus diisi" : null),
      amount: (value) => (value <= 0 ? "Masukkan nominal" : null),
    },
  });

  const handleClose = () => {
    form.reset();
    setType("BORROW");
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const formData: DebtFormData = {
      ...values,
      type,
      amount: String(values.amount),
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
    };

    const result = await createDebt(formData);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Catatan berhasil ditambahkan",
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
      title="Tambah Utang/Piutang"
      centered
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            value={type}
            onChange={(v) => setType(v as DebtType)}
            data={[
              {
                value: "BORROW",
                label: (
                  <Group gap={4} justify="center">
                    <IconArrowDown size={16} />
                    Utang (Pinjam)
                  </Group>
                ),
              },
              {
                value: "LEND",
                label: (
                  <Group gap={4} justify="center">
                    <IconArrowUp size={16} />
                    Piutang (Pinjamkan)
                  </Group>
                ),
              },
            ]}
            fullWidth
            color={type === "LEND" ? "green" : "red"}
          />

          <TextInput
            label={type === "BORROW" ? "Dari Siapa" : "Kepada Siapa"}
            placeholder="Nama orang/pihak"
            required
            {...form.getInputProps("personName")}
          />

          <NumberInput
            label="Nominal"
            placeholder="0"
            thousandSeparator=","
            prefix="Rp "
            min={0}
            required
            value={form.values.amount}
            onChange={(value) => {
              // Normalize value to remove leading zeros
              const numValue = typeof value === 'number' ? value : parseFloat(value || '0');
              form.setFieldValue('amount', isNaN(numValue) ? 0 : numValue);
            }}
            error={form.errors.amount}
          />

          <DatePickerInput
            label="Jatuh Tempo (Opsional)"
            placeholder="Pilih tanggal"
            clearable
            {...form.getInputProps("dueDate")}
          />

          <Textarea
            label="Keterangan"
            placeholder="Catatan tambahan (opsional)"
            autosize
            minRows={2}
            {...form.getInputProps("description")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={loading}
              color={type === "LEND" ? "green" : "red"}
            >
              Tambah
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
