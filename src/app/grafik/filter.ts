import dayjs from "dayjs";
import { IFilterGraph } from "./types";
import { ITransaksi } from "@/types/db";

const matchDate = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) => {
  const itemDate = dayjs(item.tanggal);
  const year = parseInt(filter.year, 10);
  const month = parseInt(filter.month, 10);
  const day = parseInt(filter.day, 10);

  switch (filter.mode) {
    case "range":
      return (
        itemDate.isAfter(dayjs(filter.tanggal_sesudah)) &&
        itemDate.isBefore(dayjs(filter.tanggal_sebelum))
      );
    case "hari":
      return (
        itemDate.year() === year &&
        itemDate.month() + 1 === month &&
        itemDate.date() === day
      );
    case "bulan":
      return itemDate.year() === year && itemDate.month() + 1 === month;
    case "tahun":
      return itemDate.year() === year;
    default:
      return false;
  }
};

const matchInformation = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) => item.keterangan.toLowerCase().includes(filter.keterangan.toLowerCase());

const matchTypeIgnore = (filter: IFilterGraph) => filter.jenis === "SEMUA";
const matchType = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) => matchTypeIgnore(filter) || item.jenis === filter.jenis;

const matchSourceIgnore = (filter: IFilterGraph) => filter.sumber.length === 0;
const matchSource = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) =>
  matchSourceIgnore(filter) ||
  filter.sumber.includes(item.sumber?.nama as string);

const matchPurposeIgnore = (filter: IFilterGraph) => filter.tujuan.length === 0;
const matchPurpose = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) =>
  matchPurposeIgnore(filter) ||
  filter.tujuan.includes(item.tujuan?.nama as string);

const matchBalanceIgnore = (filter: IFilterGraph) =>
  filter.nominal_di_atas === 0 &&
  filter.nominal_di_bawah === 0 &&
  filter.nominal_sama_dengan === 0;
const matchBalance = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) =>
  matchBalanceIgnore(filter) ||
  ((filter.nominal_di_atas === 0 || item.nominal >= filter.nominal_di_atas) &&
    (filter.nominal_di_bawah === 0 ||
      item.nominal <= filter.nominal_di_bawah) &&
    (filter.nominal_sama_dengan === 0 ||
      item.nominal === filter.nominal_sama_dengan));

const matchBankIgnore = (filter: IFilterGraph) => filter.bank === "SEMUA";
const matchBank = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) =>
  matchBankIgnore(filter) ||
  (filter.bank === "BANK" && item.bank) ||
  (filter.bank === "CASH" && !item.bank);

export {
  matchDate,
  matchInformation,
  matchType,
  matchSource,
  matchPurpose,
  matchBalance,
  matchBank,
};
