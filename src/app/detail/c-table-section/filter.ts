import stringToRupiah from "@/utils/string-to-rupiah";
import dayjs from "dayjs";
import { isBoolean, isNumber } from "lodash";
import { ITableData, IFilterDetailTable } from "../types";

const matchGeneralSearch = ({
  generalSearch,
  item,
}: {
  generalSearch: string;
  item: ITableData;
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
  item: ITableData;
  filter: IFilterDetailTable;
}) =>
  dayjs(item.tanggal).isBefore(filter.tanggal_sebelum) &&
  dayjs(item.tanggal).isAfter(filter.tanggal_sesudah);

const matchInformation = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
}) => item.keterangan.toLowerCase().includes(filter.keterangan.toLowerCase());

const matchTypeIgnore = (filter: IFilterDetailTable) => filter.jenis === "SEMUA";
const matchType = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
}) => matchTypeIgnore(filter) || item.jenis === filter.jenis;

const matchSourceIgnore = (filter: IFilterDetailTable) =>
  filter.sumber.length === 0;
const matchSource = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
}) => matchSourceIgnore(filter) || filter.sumber.includes(item.sumber);

const matchPurposeIgnore = (filter: IFilterDetailTable) =>
  filter.tujuan.length === 0;
const matchPurpose = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
}) => matchPurposeIgnore(filter) || filter.tujuan.includes(item.tujuan);

const matchBalanceIgnore = (filter: IFilterDetailTable) =>
  filter.nominal_di_atas === 0 &&
  filter.nominal_di_bawah === 0 &&
  filter.nominal_sama_dengan === 0;
const matchBalance = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
}) =>
  matchBalanceIgnore(filter) ||
  ((filter.nominal_di_atas === 0 || item.nominal >= filter.nominal_di_atas) &&
    (filter.nominal_di_bawah === 0 ||
      item.nominal <= filter.nominal_di_bawah) &&
    (filter.nominal_sama_dengan === 0 ||
      item.nominal === filter.nominal_sama_dengan));

const matchBankIgnore = (filter: IFilterDetailTable) => filter.bank === "SEMUA";
const matchBank = ({
  item,
  filter,
}: {
  item: ITableData;
  filter: IFilterDetailTable;
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
