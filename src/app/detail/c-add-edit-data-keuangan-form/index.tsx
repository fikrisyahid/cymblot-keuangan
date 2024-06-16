"use client";

import { useState } from "react";
import {
  ITransaksiFormState,
  editTransaksi,
  tambahTransaksi,
} from "@/app/actions/transaksi";
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
import { IBanks, ITujuanSumber } from "@/types/db";
import CustomAlert from "./custom-alert";
import stringCapitalize from "@/utils/string-capitalize";
import stringToRupiah from "@/utils/string-to-rupiah";

interface IInitialFormData extends ITransaksiFormState {
  id: string;
}

export default function AddEditDataKeuanganForm({
  email,
  daftarSumber,
  daftarTujuan,
  daftarBank,
  initialFormData,
  isEdit,
  totalSaldoCash,
  totalSaldoBankDetail,
}: {
  email: string;
  daftarSumber: ITujuanSumber[];
  daftarTujuan: ITujuanSumber[];
  daftarBank: IBanks[];
  initialFormData?: IInitialFormData;
  isEdit?: boolean;
  totalSaldoCash: number;
  totalSaldoBankDetail: any;
}) {
  const router = useRouter();
  const [formState, setFormState] = useState<ITransaksiFormState>({
    email,
    tanggal: initialFormData?.tanggal || new Date(),
    keterangan: initialFormData?.keterangan || "",
    jenis: initialFormData?.jenis || "PEMASUKAN",
    sumberId: initialFormData?.sumberId || "",
    tujuanId: initialFormData?.tujuanId || "",
    nominal: initialFormData?.nominal || 0,
    bank: initialFormData?.bank || false,
    namaBankId: initialFormData?.namaBankId || "",
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
    if (formState.bank && !formState.namaBankId)
      newErrors.namaBankId = "Nama bank harus diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isPenyetoranOrPenarikan =
    formState.jenis === "PENYETORAN" || formState.jenis === "PENARIKAN";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bankName =
      daftarBank.filter((item) => item.id === formState.namaBankId)[0]?.nama ||
      "";

    if (
      !formState.bank &&
      (formState.jenis === "PENYETORAN" || formState.jenis === "PENGELUARAN") &&
      formState.nominal > totalSaldoCash
    ) {
      notifications.show({
        title: "Error",
        message: `Saldo cash tidak cukup`,
        color: "red",
      });
      return;
    }

    if (
      formState.bank &&
      (formState.jenis === "PENARIKAN" || formState.jenis === "PENGELUARAN") &&
      formState.nominal > totalSaldoBankDetail[bankName]
    ) {
      notifications.show({
        title: "Error",
        message: `Saldo bank ${bankName} tidak cukup`,
        color: "red",
      });
      return;
    }

    if (validateForm()) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: (
          <Text>
            Apakah Anda yakin ingin {isEdit ? "mengubah" : "menambahkan"} data
            keuangan ini?
          </Text>
        ),
        labels: { confirm: isEdit ? "Ubah" : "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          const formData = new FormData();
          Object.keys(formState).forEach((key) => {
            formData.append(
              key,
              formState[key as keyof ITransaksiFormState] as string | Blob
            );
          });

          try {
            if (isEdit) {
              await editTransaksi(initialFormData?.id as string, formData);
            } else {
              await tambahTransaksi(formData);
            }
            notifications.show({
              title: "Sukses",
              message: `Data keuangan berhasil ${
                isEdit ? "diubah" : "ditambahkan"
              }`,
              color: "green",
            });
            router.push("/detail");
          } catch (error) {
            notifications.show({
              title: "Error",
              message: `Gagal ${
                isEdit ? "mengubah" : "menambahkan"
              } data keuangan`,
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
          disabled={isPenyetoranOrPenarikan}
        />
        {isPenyetoranOrPenarikan ? (
          <Select
            label="Jenis Transaksi"
            placeholder="Pilih jenis transaksi"
            data={[
              { value: "PENARIKAN", label: "Penarikan" },
              { value: "PENYETORAN", label: "Penyetoran" },
            ]}
            value={formState.jenis}
            onChange={(value) => {
              handleChange({ jenis: value as JENIS_TRANSAKSI });
              if (isPenyetoranOrPenarikan) {
                handleChange({
                  keterangan: `${stringCapitalize(
                    value as JENIS_TRANSAKSI
                  )} uang sebesar ${stringToRupiah(
                    formState.nominal.toString()
                  )} ${value === "PENARIKAN" ? "dari" : "ke"} ${
                    daftarBank.filter(
                      (bank) => bank.id === formState.namaBankId
                    )[0].nama
                  }`,
                });
              }
            }}
            required
            error={errors.jenis}
          />
        ) : (
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
        )}
        {formState.jenis === "PEMASUKAN" ? (
          <Select
            label="Sumber"
            placeholder="Pilih sumber"
            data={daftarSumber.map((sumber) => ({
              value: sumber.id,
              label: sumber.nama,
            }))}
            value={formState.sumberId}
            onChange={(value) => handleChange({ sumberId: value as string })}
            error={errors.sumberId}
            required
            disabled={daftarSumber.length === 0}
          />
        ) : (
          formState.jenis === "PENGELUARAN" && (
            <Select
              label="Tujuan"
              placeholder="Pilih tujuan"
              data={daftarTujuan.map((tujuan) => ({
                value: tujuan.id,
                label: tujuan.nama,
              }))}
              value={formState.tujuanId}
              onChange={(value) => handleChange({ tujuanId: value as string })}
              error={errors.tujuanId}
              required
              disabled={daftarTujuan.length === 0}
            />
          )
        )}
        {((daftarSumber.length === 0 && formState.jenis === "PEMASUKAN") ||
          (daftarTujuan.length === 0 && formState.jenis === "PENGELUARAN")) && (
          <>
            <CustomAlert
              href="/sumber-tujuan"
              buttonString={
                formState.jenis === "PEMASUKAN"
                  ? "Tambah sumber"
                  : "Tambah tujuan"
              }
              message={
                formState.jenis === "PEMASUKAN"
                  ? "Kamu belum memiliki sumber keuangan. Silakan tambahkan sumber."
                  : "Kamu belum memiliki tujuan keuangan. Silakan tambahkan tujuan."
              }
            />
          </>
        )}
        <NumberInput
          label="Nominal"
          placeholder="Nominal"
          value={formState.nominal}
          onChange={(value) => {
            handleChange({ nominal: +value });
            if (isPenyetoranOrPenarikan) {
              handleChange({
                keterangan: `${stringCapitalize(
                  formState.jenis
                )} uang sebesar ${stringToRupiah(value.toString())} ${
                  formState.jenis === "PENARIKAN" ? "dari" : "ke"
                } ${
                  daftarBank.filter(
                    (bank) => bank.id === formState.namaBankId
                  )[0].nama
                }`,
              });
            }
          }}
          thousandSeparator=","
          prefix="Rp"
          required
          error={errors.nominal}
        />
        <Checkbox
          disabled={
            formState.jenis === "PENARIKAN" || formState.jenis === "PENYETORAN"
          }
          label="Bank"
          checked={formState.bank}
          onChange={(e) => handleChange({ bank: e.currentTarget.checked })}
        />
        {formState.bank && (
          <Select
            label="Nama Bank"
            placeholder="Pilih nama bank"
            data={daftarBank.map((bank) => ({
              value: bank.id,
              label: bank.nama,
            }))}
            value={formState.namaBankId}
            onChange={(value) => {
              handleChange({ namaBankId: value as string });
              if (isPenyetoranOrPenarikan) {
                handleChange({
                  keterangan: `${stringCapitalize(
                    formState.jenis
                  )} uang sebesar ${stringToRupiah(
                    formState.nominal.toString()
                  )} ${formState.jenis === "PENARIKAN" ? "dari" : "ke"} ${
                    daftarBank.filter((bank) => bank.id === value)[0].nama
                  }`,
                });
              }
            }}
            error={errors.namaBankId}
            required
            disabled={daftarBank.length === 0}
          />
        )}
        {daftarBank.length === 0 && formState.bank && (
          <CustomAlert
            buttonString="Tambah Bank"
            message="Kamu belum memiliki Bank keuangan. Silakan tambahkan bank."
            href="/bank"
          />
        )}
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
