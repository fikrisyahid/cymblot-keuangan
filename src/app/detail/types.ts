import { DateValue } from "@mantine/dates";

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
  bank: string;
}

interface ITableData {
  id: string;
  no: number;
  tanggal: Date;
  keterangan: string;
  jenis: "PEMASUKAN" | "PENGELUARAN";
  sumber: string;
  tujuan: string;
  nominal: number;
  bank: boolean;
}

export type { IFilterDetailTable, ITableData };
