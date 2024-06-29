"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import { Flex } from "@mantine/core";
import "dayjs/locale/id";
import { TEXT_COLOR } from "@/config";
import { useDebouncedState } from "@mantine/hooks";
import generateDetailTableColumns from "./c-table-columns";
import {
  matchBalance,
  matchDate,
  matchGeneralSearch,
  matchInformation,
  matchType,
  matchPurpose,
  matchSource,
} from "./filter";
import { IBanks, ITujuanSumber } from "@/types/db";
import DetailHeader from "./header";
import getBalanceFiltered from "./helper";
import { IFilterDetailTable, ITableData } from "../types";

const PAGE_SIZES = [10, 15, 25, 50, 75, 100];

export default function TableSection({
  data,
  bankId,
  daftarSumber,
  daftarTujuan,
  daftarBank,
  oldestDate,
}: {
  data: ITableData[];
  bankId: string;
  daftarSumber: ITujuanSumber[];
  daftarTujuan: ITujuanSumber[];
  daftarBank: IBanks[];
  oldestDate: Date;
}) {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [generalSearch, setGeneralSearch] = useDebouncedState("", 200);
  const [filter, setFilter] = useState<IFilterDetailTable>({
    tanggal_sesudah: oldestDate,
    tanggal_sebelum: new Date(),
    keterangan: "",
    jenis: "SEMUA",
    sumber: [],
    tujuan: [],
    nominal_di_bawah: 0,
    nominal_di_atas: 0,
    nominal_sama_dengan: 0,
  });
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "no",
    direction: "asc",
  });

  const handleChangeFilter = (newObj: Partial<IFilterDetailTable>) =>
    setFilter((old) => ({ ...old, ...newObj }));

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          matchGeneralSearch({ generalSearch, item }) &&
          matchDate({ item, filter }) &&
          matchInformation({ item, filter }) &&
          matchType({ item, filter }) &&
          matchSource({ item, filter }) &&
          matchPurpose({ item, filter }) &&
          matchBalance({ item, filter })
      ),
    [data, filter, generalSearch]
  );

  // Memoize sorted data based on filtered data
  const sortedData = useMemo(() => {
    const sorted = sortBy(filteredData, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, sortStatus]);

  // Memoize paginated records based on sorted data
  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedData.slice(from, to);
  }, [sortedData, page, pageSize]);

  const totalSaldo = getBalanceFiltered({ filter, filteredData });

  // Reset to first page when page size or sort status changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, sortStatus]);

  return (
    <Flex direction="column" gap="sm">
      <DetailHeader
        bankId={bankId}
        totalSaldo={totalSaldo}
        oldestDate={oldestDate}
        generalSearch={generalSearch}
        setGeneralSearch={setGeneralSearch}
        handleChangeFilter={handleChangeFilter}
      />
      <DataTable
        minHeight={filteredData.length === 0 ? 200 : 0}
        withTableBorder
        records={paginatedRecords}
        style={{ color: TEXT_COLOR }}
        columns={generateDetailTableColumns({
          filter,
          handleChangeFilter,
          daftarSumber,
          daftarTujuan,
          daftarBank,
          oldestDate,
        })}
        totalRecords={filteredData.length}
        borderRadius="md"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        noRecordsText="Tidak ada data yang ditemukan"
      />
    </Flex>
  );
}
