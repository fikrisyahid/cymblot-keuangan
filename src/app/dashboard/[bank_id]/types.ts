import { DateValue } from "@mantine/dates";
import { JENIS_TRANSAKSI } from "@prisma/client";

interface IFilterDetailTable {
  tanggal_sebelum: DateValue;
  tanggal_sesudah: DateValue;
  keterangan: string;
  jenis: string;
  sumber: string[];
  tujuan: string[];
  nominal_di_bawah: number;
  nominal_di_atas: number;
  nominal_sama_dengan: number;
}

interface ITableData {
  id: string;
  no: number;
  tanggal: Date;
  keterangan: string;
  jenis: JENIS_TRANSAKSI;
  sumber: string;
  tujuan: string;
  nominal: number;
}

export type { IFilterDetailTable, ITableData };
