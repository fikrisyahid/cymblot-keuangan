import { DateValue } from "@mantine/dates";

export interface filterDetailTable {
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
