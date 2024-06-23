"use client";

import React, { useState } from "react";
import { penarikanPenyetoran } from "@/app/actions/transaksi";
import { Alert, Button, NumberInput, Select, Stack, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { IBanks } from "@/types/db";
import Link from "next/link";
import { useRouter } from "next-nprogress-bar";

export default function PenarikanPenyetoranForm({
  daftarBank,
  totalSaldoCash,
  totalSaldoBankDetail,
}: {
  daftarBank: IBanks[];
  totalSaldoCash: number;
  totalSaldoBankDetail: any;
}) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    mode: "PENARIKAN",
    nominal: 0,
    bankNameId: "",
  });

  const handleChange = (newState: Partial<typeof formState>) => {
    setFormState((state) => ({ ...state, ...newState }));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { mode, nominal, bankNameId } = formState;

    const bankName = daftarBank.filter((item) => item.id === bankNameId)[0]
      .nama;

    if (mode === "PENYETORAN" && nominal > totalSaldoCash) {
      notifications.show({
        title: "Error",
        message: `Saldo cash tidak cukup`,
        color: "red",
      });
      return;
    }

    if (mode === "PENARIKAN" && nominal > totalSaldoBankDetail[bankName]) {
      notifications.show({
        title: "Error",
        message: `Saldo bank ${bankName} tidak cukup`,
        color: "red",
      });
      return;
    }

    if (mode && nominal && bankNameId) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: <Text>Apakah Anda yakin ingin melakukan transaksi ini?</Text>,
        labels: { confirm: "Ya", cancel: "Tidak" },
        onConfirm: async () => {
          const formData = new FormData();
          formData.set("mode", mode);
          formData.set("nominal", nominal.toString());
          formData.set("bankNameId", bankNameId);
          formData.set(
            "bankName",
            daftarBank.filter((item) => item.id === bankNameId)[0].nama
          );

          try {
            await penarikanPenyetoran(formData);
            handleChange({ nominal: 0 });
            handleChange({ bankNameId: "" });

            notifications.show({
              title: "Sukses",
              message: `Transaksi berhasil dilakukan`,
              color: "green",
            });
            router.push("/detail");
          } catch (error) {
            notifications.show({
              title: "Error",
              message: `Gagal melakukan transaksi`,
              color: "red",
            });
          }
        },
      });
    } else {
      notifications.show({
        title: "Error",
        message: `Masih ada data yang kosong`,
        color: "red",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Select
          name="mode"
          label="Mode"
          placeholder="Pilih Mode"
          data={["PENARIKAN", "PENYETORAN"]}
          value={formState.mode}
          onChange={(value) => handleChange({ mode: value as string })}
        />
        <Select
          label="Bank"
          disabled={daftarBank.length === 0}
          placeholder="Pilih Bank"
          data={daftarBank.map((item) => ({
            value: item.id,
            label: item.nama,
          }))}
          value={formState.bankNameId}
          onChange={(value) => handleChange({ bankNameId: value as string })}
        />
        {daftarBank.length === 0 && (
          <Alert
            variant="filled"
            color="indigo"
            title="Info"
            icon={<IconInfoCircle />}
            p="xs"
          >
            <Stack align="start">
              Kamu belum memiliki bank. Silahkan tambahkan bank terlebih dahulu.
              <Button component={Link} href="/bank" color="teal">
                Tambahkan Bank
              </Button>
            </Stack>
          </Alert>
        )}
        <NumberInput
          label="Nominal"
          placeholder="Masukkan nominal"
          thousandSeparator=","
          prefix="Rp"
          allowNegative={false}
          value={formState.nominal}
          onChange={(value) => handleChange({ nominal: +value })}
        />

        <Button leftSection={<IconPlus />} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
