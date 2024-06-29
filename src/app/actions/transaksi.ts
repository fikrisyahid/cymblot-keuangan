"use server";

import { JENIS_TRANSAKSI } from "@prisma/client";
import prisma from "../db/init";
import { DateValue } from "@mantine/dates";
import revalidateAllRoute from "./revalidate-all-route";
import { currentUser } from "@clerk/nextjs/server";
import stringToRupiah from "@/utils/string-to-rupiah";

export async function tambahTransaksi(data: FormData) {
  const email = data.get("email") as string;
  const tanggal = new Date(data.get("tanggal") as string);
  const keterangan = data.get("keterangan") as string;
  const jenis = data.get("jenis") as JENIS_TRANSAKSI;
  const sumberId = data.get("sumberId") as string;
  const tujuanId = data.get("tujuanId") as string;
  const nominal = parseInt(data.get("nominal") as string, 10);
  const bank = data.get("bank") === "true";
  const namaBankId = data.get("namaBankId") as string;

  // Validasi
  if (!email || !tanggal || !keterangan || !jenis || nominal <= 0) {
    throw new Error("Semua field wajib diisi dan nominal harus lebih dari 0.");
  }

  if (jenis === "PEMASUKAN" && !sumberId) {
    throw new Error("Sumber harus dipilih untuk jenis transaksi PEMASUKAN.");
  }

  if (jenis === "PENGELUARAN" && !tujuanId) {
    throw new Error("Tujuan harus dipilih untuk jenis transaksi PENGELUARAN.");
  }

  await prisma.transaksi.create({
    data: {
      email,
      tanggal,
      keterangan,
      jenis,
      sumberId: jenis === "PEMASUKAN" ? sumberId : null,
      tujuanId: jenis === "PENGELUARAN" ? tujuanId : null,
      nominal,
      bank,
      bankNameId: bank ? namaBankId : null,
    },
  });

  revalidateAllRoute();
}

export async function editTransaksi(id: string, data: FormData) {
  const tanggal = new Date(data.get("tanggal") as string);
  const keterangan = data.get("keterangan") as string;
  const jenis = data.get("jenis") as JENIS_TRANSAKSI;
  const sumberId = data.get("sumberId") as string;
  const tujuanId = data.get("tujuanId") as string;
  const nominal = parseInt(data.get("nominal") as string, 10);
  const bank = data.get("bank") === "true";
  const namaBankId = data.get("namaBankId") as string;

  // Validasi
  if (!tanggal || !keterangan || !jenis || nominal <= 0) {
    throw new Error("Semua field wajib diisi dan nominal harus lebih dari 0.");
  }

  if (jenis === "PEMASUKAN" && !sumberId) {
    throw new Error("Sumber harus dipilih untuk jenis transaksi PEMASUKAN.");
  }

  if (jenis === "PENGELUARAN" && !tujuanId) {
    throw new Error("Tujuan harus dipilih untuk jenis transaksi PENGELUARAN.");
  }

  await prisma.transaksi.update({
    where: { id },
    data: {
      tanggal,
      keterangan,
      jenis,
      sumberId: jenis === "PEMASUKAN" ? sumberId : null,
      tujuanId: jenis === "PENGELUARAN" ? tujuanId : null,
      nominal,
      bank,
      bankNameId: bank ? namaBankId : null,
    },
  });

  revalidateAllRoute();
}

export async function deleteTransaksi(id: string) {
  await prisma.transaksi.delete({ where: { id } });
  revalidateAllRoute();
}

export async function penarikanPenyetoran(formData: FormData) {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    throw new Error("Anda belum login");
  }

  const nominal = parseInt(formData.get("nominal") as string, 10);
  const mode = formData.get("mode") as "PENYETORAN" | "PENARIKAN";
  const bankNameId = formData.get("bankNameId") as string;
  const bankName = formData.get("bankName") as string;

  if (mode === "PENARIKAN") {
    await prisma.transaksi.create({
      data: {
        email,
        tanggal: new Date(),
        keterangan: `Penarikan uang sebesar ${stringToRupiah(
          nominal.toString()
        )} dari ${bankName}`,
        jenis: "PENARIKAN",
        nominal,
        bank: true,
        bankNameId,
      },
    });
  }

  if (mode === "PENYETORAN") {
    await prisma.transaksi.create({
      data: {
        email,
        tanggal: new Date(),
        keterangan: `Penyetoran uang sebesar ${stringToRupiah(
          nominal.toString()
        )} ke ${bankName}`,
        jenis: "PENYETORAN",
        nominal,
        bank: true,
        bankNameId,
      },
    });
  }
}

export async function transfer(formData: FormData) {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;

  if (!email) {
    throw new Error("Anda belum login");
  }

  const nominal = parseInt(formData.get("nominal") as string, 10);
  const bankNameId = formData.get("bankNameId") as string;
  const bankId = formData.get("bankId") as string;

  console.log(nominal, bankNameId);

  if (!nominal || !bankNameId) {
    throw new Error("Data nominal atau bankNameId tidak lengkap");
  }

  const bankDestination = await prisma.banks.findUnique({
    where: { id: bankNameId },
    select: { nama: true, email: true },
  });

  const bankSourceName = await prisma.banks.findUnique({
    where: { id: bankId },
    select: { nama: true, email: true },
  });

  if (!bankSourceName) {
    throw new Error("Bank asal tidak ditemukan");
  }

  if (!bankDestination) {
    throw new Error("Bank tujuan tidak ditemukan");
  }

  const keteranganPengeluaran = `Transfer ke bank ${bankDestination.nama} (${bankDestination.email}) sebesar ${nominal}`;
  const keteranganPemasukan = `Transfer dari bank ${bankSourceName.nama} (${bankSourceName.email}) sebesar ${nominal}`;

  await Promise.all([
    prisma.transaksi.create({
      data: {
        email: bankSourceName.email,
        jenis: "PENGELUARAN",
        nominal,
        bank: true,
        bankNameId: bankId,
        keterangan: keteranganPengeluaran,
      },
    }),
    prisma.transaksi.create({
      data: {
        email: bankDestination.email,
        jenis: "PEMASUKAN",
        nominal,
        bank: true,
        bankNameId: bankNameId,
        keterangan: keteranganPemasukan,
      },
    }),
  ]);

  revalidateAllRoute();
}

export interface ITransaksiFormState {
  email: string;
  tanggal: DateValue;
  keterangan: string;
  jenis: JENIS_TRANSAKSI;
  sumberId: string;
  tujuanId: string;
  nominal: number;
  bank: boolean;
  namaBankId: string;
}
