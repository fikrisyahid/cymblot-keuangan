import stringToRupiah from "@/utils/string-to-rupiah";
import dayjs from "dayjs";
import { isBoolean, isNumber } from "lodash";
import { tableData, filterDetailTable } from "../types";

const matchGeneralSearch = ({
  generalSearch,
  item,
}: {
  generalSearch: string;
  item: tableData;
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
  item: tableData;
  filter: filterDetailTable;
}) =>
  dayjs(item.tanggal).isBefore(filter.tanggal_sebelum) &&
  dayjs(item.tanggal).isAfter(filter.tanggal_sesudah);

const matchInformation = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
}) => item.keterangan.toLowerCase().includes(filter.keterangan.toLowerCase());

const matchTypeIgnore = (filter: filterDetailTable) => filter.jenis === "SEMUA";
const matchType = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
}) => matchTypeIgnore(filter) || item.jenis === filter.jenis;

const matchSourceIgnore = (filter: filterDetailTable) =>
  filter.sumber.length === 0;
const matchSource = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
}) => matchSourceIgnore(filter) || filter.sumber.includes(item.sumber);

const matchPurposeIgnore = (filter: filterDetailTable) =>
  filter.tujuan.length === 0;
const matchPurpose = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
}) => matchPurposeIgnore(filter) || filter.tujuan.includes(item.tujuan);

const matchBalanceIgnore = (filter: filterDetailTable) =>
  filter.nominal_di_atas === 0 &&
  filter.nominal_di_bawah === 0 &&
  filter.nominal_sama_dengan === 0;
const matchBalance = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
}) =>
  matchBalanceIgnore(filter) ||
  ((filter.nominal_di_atas === 0 || item.nominal >= filter.nominal_di_atas) &&
    (filter.nominal_di_bawah === 0 ||
      item.nominal <= filter.nominal_di_bawah) &&
    (filter.nominal_sama_dengan === 0 ||
      item.nominal === filter.nominal_sama_dengan));

const matchBankIgnore = (filter: filterDetailTable) => filter.bank === "SEMUA";
const matchBank = ({
  item,
  filter,
}: {
  item: tableData;
  filter: filterDetailTable;
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
