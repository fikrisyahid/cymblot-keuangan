"use client";

import { transfer } from "@/app/actions/transaksi";
import { Button, NumberInput, Select, Stack, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

export default function TransferForm({
  bankBalance,
  otherBankLists,
  bankId,
}: {
  bankBalance: number;
  otherBankLists: { id: string; email: string; nama: string }[];
  bankId: string;
}) {
  const router = useRouter();
  const [stateForm, setStateForm] = useState({
    nominal: "",
    bankNameId: "",
  });
  const [stateError, setStateError] = useState({
    nominal: false,
    bankNameId: false,
  });

  function handleChange(newObj: Partial<typeof stateForm>) {
    setStateForm((state) => ({
      ...state,
      ...newObj,
    }));
  }

  function checkError() {
    const { nominal, bankNameId } = stateForm;
    const hasError = !nominal || +nominal <= 0 || !bankNameId;
    setStateError({
      nominal: !nominal || +nominal <= 0,
      bankNameId: !bankNameId,
    });
    return hasError;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const { nominal, bankNameId } = stateForm;
    const hasError = checkError();

    if (+nominal > bankBalance) {
      notifications.show({
        title: "Error",
        message: `Nominal transfer melebihi saldo`,
        color: "red",
      });
      return;
    }

    if (!hasError) {
      openConfirmModal({
        title: "Konfirmasi Penambahan",
        children: <Text>Apakah Anda yakin ingin melakukan transfer?</Text>,
        labels: { confirm: "Tambah", cancel: "Batal" },
        onConfirm: async () => {
          const formData = new FormData();
          formData.set("nominal", nominal);
          formData.set("bankNameId", bankNameId);
          formData.set("bankId", bankId);

          try {
            await transfer(formData);
            setStateForm({
              nominal: "",
              bankNameId: "",
            });
            notifications.show({
              title: "Sukses",
              message: `Transfer berhasil dilakukan`,
              color: "green",
            });
            router.push(`/dashboard/${bankId}`);
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
          label="Pilih tujuan transfer"
          placeholder="Bank tujuan transfer"
          data={otherBankLists.map((bank) => ({
            value: bank.id,
            label: `${bank.email} - ${bank.nama}`,
          }))}
          error={stateError.bankNameId}
          onChange={(value) => handleChange({ bankNameId: value as string })}
        />
        <NumberInput
          label="Nominal"
          placeholder="Nominal transfer"
          defaultValue={0}
          allowDecimal={false}
          allowNegative={false}
          min={0}
          thousandSeparator=","
          prefix="Rp"
          error={stateError.nominal}
          onChange={(value) => handleChange({ nominal: value as string })}
        />
        <Button leftSection={<IconUpload />} type="submit">
          Transfer
        </Button>
      </Stack>
    </form>
  );
}
