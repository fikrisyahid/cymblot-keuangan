import { JENIS_TRANSAKSI } from "@prisma/client";

interface ITujuanSumber {
  id: string;
  email: string;
  nama: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITransaksi {
  id: string;
  email: string;
  tanggal: Date;
  keterangan: string;
  jenis: JENIS_TRANSAKSI;
  sumberId?: string | null;
  sumber?: ITujuanSumber | null;
  tujuanId?: string | null;
  tujuan?: ITujuanSumber | null;
  nominal: number;
  bank?: boolean;
  bankNameId?: string | null;
  bankName?: IBanks | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IBanks {
  id: string;
  email: string;
  nama: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { ITujuanSumber, ITransaksi, IBanks };
