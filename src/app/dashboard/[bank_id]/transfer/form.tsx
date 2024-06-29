"use client";

import { transfer } from "@/app/actions/transaksi";
import { Button, NumberInput, Select, Stack, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useRef, useState } from "react";

export default function TransferForm({
  bankBalance,
  otherBankLists,
}: {
  bankBalance: number;
  otherBankLists: { id: string; email: string; nama: string }[];
}) {
  const router = useRouter();
  const nominalRef = useRef<HTMLInputElement>(null);
  const bankNameIdRef = useRef<HTMLInputElement>(null);
  const [nominalError, setNominalError] = useState<string | null>(null);
  const [bankNameIdError, setBankNameIdError] = useState<string | null>(null);

  function validateFields(nominal: string, bankNameId: string): boolean {
    let error = false;

    if (!nominal) {
      setNominalError("Nominal tidak boleh kosong");
      error = true;
    } else if (+nominal <= 0) {
      setNominalError("Nominal tidak boleh kurang dari sama dengan 0");
      error = true;
    } else {
      setNominalError(null);
    }

    if (!bankNameId) {
      setBankNameIdError("Pilih bank tujuan");
      error = true;
    } else {
      setBankNameIdError(null);
    }

    return error;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nominal = nominalRef.current?.value || "";
    const bankNameId = bankNameIdRef.current?.value || "";

    console.log(nominal,bankNameId)

    const hasError = validateFields(nominal, bankNameId);

    if (!hasError) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: <Text>Apakah Anda yakin ingin melakukan transfer?</Text>,
        labels: { confirm: "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          const formData = new FormData();
          formData.set("nominal", nominal);
          formData.set("bankNameId", bankNameId);

          try {
            await transfer(formData);
            if (nominalRef.current) {
              nominalRef.current.value = "";
            }
            if (bankNameIdRef.current) {
              bankNameIdRef.current.value = "";
            }
            notifications.show({
              title: "Sukses",
              message: `Transfer berhasil dilakukan`,
              color: "green",
            });
            router.push(`/dashboard/${bankNameId}`);
          } catch (error) {
            notifications.show({
              title: "Error",
              message: `Gagal melakukan transfer`,
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
          ref={bankNameIdRef}
          label="Pilih tujuan transfer"
          placeholder="Bank tujuan transfer"
          data={otherBankLists.map((bank) => ({
            value: bank.id,
            label: `${bank.email} - ${bank.nama}`,
          }))}
          error={bankNameIdError}
        />
        <NumberInput
          ref={nominalRef}
          label="Nominal"
          placeholder="Nominal transfer"
          defaultValue={0}
          allowDecimal={false}
          allowNegative={false}
          min={0}
          max={bankBalance}
          thousandSeparator=","
          prefix="Rp"
          error={nominalError}
        />
        <Button leftSection={<IconUpload />} type="submit">
          Transfer
        </Button>
      </Stack>
    </form>
  );
}
