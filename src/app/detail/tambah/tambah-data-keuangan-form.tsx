"use client";

import { useState } from "react";
import { ITransaksiFormState, tambahTransaksi } from "@/app/actions/transaksi";
import {
  Button,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Flex,
  rem,
  Text,
} from "@mantine/core";
import { BUTTON_BASE_COLOR } from "@/config";
import { JENIS_TRANSAKSI } from "@prisma/client";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { IconCalendar } from "@tabler/icons-react";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next-nprogress-bar";
import { ITujuanSumber } from "@/types/db";

export default function TambahDataKeuangan({
  email,
  daftarSumber,
  daftarTujuan,
}: {
  email: string;
  daftarSumber: ITujuanSumber[];
  daftarTujuan: ITujuanSumber[];
}) {
  const router = useRouter();
  const [formState, setFormState] = useState<ITransaksiFormState>({
    email,
    tanggal: new Date(),
    keterangan: "",
    jenis: "PEMASUKAN",
    sumberId: "",
    tujuanId: "",
    nominal: 0,
    bank: false,
  });
  const [errors, setErrors] = useState<any>({});

  const handleChange = (newObj: Partial<ITransaksiFormState>) =>
    setFormState((prevState) => ({ ...prevState, ...newObj }));

  const validateForm = (): boolean => {
    const newErrors: any = {};
    if (!formState.tanggal) newErrors.tanggal = "Tanggal harus diisi";
    if (!formState.keterangan) newErrors.keterangan = "Keterangan harus diisi";
    if (!formState.jenis) newErrors.jenis = "Jenis transaksi harus dipilih";
    if (formState.jenis === "PEMASUKAN" && !formState.sumberId)
      newErrors.sumberId = "Sumber harus dipilih";
    if (formState.jenis === "PENGELUARAN" && !formState.tujuanId)
      newErrors.tujuanId = "Tujuan harus dipilih";
    if (formState.nominal <= 0)
      newErrors.nominal = "Nominal harus lebih dari 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: (
          <Text>Apakah Anda yakin ingin menambahkan data keuangan ini?</Text>
        ),
        labels: { confirm: "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          const formData = new FormData();
          Object.keys(formState).forEach((key) => {
            formData.append(
              key,
              formState[key as keyof ITransaksiFormState] as string | Blob
            );
          });

          try {
            tambahTransaksi(formData);
            notifications.show({
              title: "Sukses",
              message: "Data keuangan berhasil ditambahkan",
              color: "green",
            });
            router.push("/detail");
          } catch (error) {
            notifications.show({
              title: "Error",
              message: "Gagal menambahkan data keuangan",
              color: "red",
            });
          }
        },
      });
    } else {
      notifications.show({
        title: "Error",
        message: "Ada data yang masih belum diisi",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="sm">
        <DateTimePicker
          required
          label="Tanggal"
          placeholder="Masukkan tanggal"
          valueFormatter={({ date }) =>
            dayjs(date?.toString()).locale("id").format("DD MMMM YYYY hh:mm A")
          }
          leftSection={
            <IconCalendar
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          }
          value={formState.tanggal}
          onChange={(e) => handleChange({ tanggal: e })}
          error={errors.tanggal}
        />
        <Textarea
          required
          label="Keterangan"
          placeholder="Masukkan keterangan"
          value={formState.keterangan}
          onChange={(e) => handleChange({ keterangan: e.currentTarget.value })}
          error={errors.keterangan}
        />
        <Select
          label="Jenis Transaksi"
          placeholder="Pilih jenis transaksi"
          data={[
            { value: "PEMASUKAN", label: "Pemasukan" },
            { value: "PENGELUARAN", label: "Pengeluaran" },
          ]}
          value={formState.jenis}
          onChange={(value) =>
            handleChange({ jenis: value as JENIS_TRANSAKSI })
          }
          required
          error={errors.jenis}
        />
        {formState.jenis === "PEMASUKAN" && (
          <Select
            required
            label="Sumber"
            placeholder="Pilih sumber"
            data={daftarSumber.map((sumber) => ({
              value: sumber.id,
              label: sumber.nama,
            }))}
            value={formState.sumberId}
            onChange={(value) => handleChange({ sumberId: value as string })}
            error={errors.sumberId}
          />
        )}
        {formState.jenis === "PENGELUARAN" && (
          <Select
            required
            label="Tujuan"
            placeholder="Pilih tujuan"
            data={daftarTujuan.map((tujuan) => ({
              value: tujuan.id,
              label: tujuan.nama,
            }))}
            value={formState.tujuanId}
            onChange={(value) => handleChange({ tujuanId: value as string })}
            error={errors.tujuanId}
          />
        )}
        <NumberInput
          label="Nominal"
          placeholder="Nominal"
          value={formState.nominal}
          onChange={(value) => handleChange({ nominal: +value })}
          thousandSeparator=","
          prefix="Rp"
          required
          error={errors.nominal}
        />
        <Checkbox
          label="Bank"
          checked={formState.bank}
          onChange={(e) => handleChange({ bank: e.currentTarget.checked })}
          error={errors.bank}
        />
        <Button type="submit" style={{ backgroundColor: BUTTON_BASE_COLOR }}>
          Submit
        </Button>
        {Object.keys(errors).length > 0 && (
          <Text c="red" size="sm">
            Tolong isi semua field yang wajib.
          </Text>
        )}
      </Flex>
    </form>
  );
}
