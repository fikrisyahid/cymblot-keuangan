import stringToRupiah from "@/utils/string-to-rupiah";
import dayjs from "dayjs";
import { isBoolean, isNumber } from "lodash";
import { IFilterGraph } from "./types";
import { ITransaksi } from "@/types/db";

const matchGeneralSearch = ({
  generalSearch,
  item,
}: {
  generalSearch: string;
  item: ITransaksi[];
}) =>
  Object.values(item).some((value: any) => {
    if (value instanceof Date) {
      return dayjs(value)
        .locale("id")
        .format("DD MMMM YYYY pukul H:m:s")
        .toLowerCase()
        .includes(generalSearch.toLowerCase());
    }
    if (isBoolean(value)) {
      const booleanString = value ? "ya" : "tidak";
      return booleanString.toLowerCase().includes(generalSearch.toLowerCase());
    }
    if (isNumber(value)) {
      return stringToRupiah(value.toString())
        .toLowerCase()
        .includes(generalSearch);
    }
    return value.toString().toLowerCase().includes(generalSearch.toLowerCase());
  });

const matchDate = ({
  item,
  filter,
}: {
  item: ITransaksi;
  filter: IFilterGraph;
}) =>
  dayjs(item.tanggal).isBefore(filter.tanggal_sebelum) &&
  dayjs(item.tanggal).isAfter(filter.tanggal_sesudah);

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
  matchGeneralSearch,
  matchDate,
  matchInformation,
  matchType,
  matchSource,
  matchPurpose,
  matchBalance,
  matchBank,
};
