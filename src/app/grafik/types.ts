import { DateValue } from "@mantine/dates";

interface IFilterGraph {
  mode: "range" | "hari" | "bulan" | "tahun";
  year: string;
  month: string;
  day: string;
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

export type { IFilterGraph };
