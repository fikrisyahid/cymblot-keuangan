import MainCard from "@/components/main-card";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { Button, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/app/db/init";
import AddEditDataKeuanganForm from "../c-add-edit-data-keuangan-form/add-data-keuangan-form";

async function getUserSumberTujuan(email: string) {
  const [daftarSumber, daftarTujuan] = await Promise.all([
    prisma.sumber.findMany({ where: { email } }),
    prisma.tujuan.findMany({ where: { email } }),
  ]);

  return { daftarSumber, daftarTujuan };
}

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    return <p>Anda harus login terlebih dahulu</p>;
  }

  const { daftarSumber, daftarTujuan } = await getUserSumberTujuan(email);

  const { id } = params;
  const dataKeuangan = await prisma.transaksi.findUnique({
    where: { id },
  });

  if (!dataKeuangan) {
    return <p>Data tidak ditemukan</p>;
  }

  return (
    <MainCard>
      <MainCard transparent noPadding row style={{ alignItems: "center" }}>
        <Button
          component={Link}
          href="/detail"
          leftSection={<IconArrowLeft />}
          style={{ backgroundColor: BUTTON_BASE_COLOR }}
        >
          Kembali
        </Button>
        <Title style={{ color: TEXT_COLOR, textAlign: "center" }}>
          Edit Data Keuangan
        </Title>
      </MainCard>
      <AddEditDataKeuanganForm
        isEdit
        email={email}
        daftarSumber={daftarSumber}
        daftarTujuan={daftarTujuan}
        initialFormData={{
          email,
          id: dataKeuangan.id,
          tanggal: dataKeuangan.tanggal,
          keterangan: dataKeuangan.keterangan,
          jenis: dataKeuangan.jenis,
          sumberId: dataKeuangan.sumberId || "",
          tujuanId: dataKeuangan.tujuanId || "",
          nominal: dataKeuangan.nominal,
          bank: dataKeuangan.bank,
        }}
      />
    </MainCard>
  );
}
