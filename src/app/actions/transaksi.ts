"use server";

import { JENIS_TRANSAKSI } from "@prisma/client";
import prisma from "../db/init";
import { DateValue } from "@mantine/dates";
import revalidateAllRoute from "./revalidate-all-route";

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
