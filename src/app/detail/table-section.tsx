"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import { Badge, Button, Flex, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { IconList, IconRestore } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { filterDetailTable } from "./types";
import { TEXT_COLOR } from "@/config";
import { useMediaQuery } from "@mantine/hooks";
import MainCard from "@/components/main-card";
import generateDetailTableColumns from "./table-columns";

const PAGE_SIZES = [10, 15, 25, 50, 75, 100];

export default function TableSection({
  data,
  daftarSumber,
  daftarTujuan,
  oldestDate,
}: {
  data: any[];
  daftarSumber: any[];
  daftarTujuan: any[];
  oldestDate: Date;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<filterDetailTable>({
    tanggal_sesudah: oldestDate,
    tanggal_sebelum: new Date(),
    keterangan: "",
    jenis: "SEMUA",
    sumber: [],
    tujuan: [],
    nominal_di_bawah: 0,
    nominal_di_atas: 0,
    nominal_sama_dengan: 0,
    bank: "SEMUA",
  });
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "no",
    direction: "asc",
  });

  const handleChangeFilter = (newObj: Partial<filterDetailTable>) =>
    setFilter((old) => ({ ...old, ...newObj }));

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    const filtered = data.filter((item) => {
      // Filter by tanggal
      if (
        (filter.tanggal_sesudah &&
          dayjs(item.tanggal).isBefore(filter.tanggal_sesudah)) ||
        (filter.tanggal_sebelum &&
          dayjs(item.tanggal).isAfter(filter.tanggal_sebelum))
      ) {
        return false;
      }

      // Filter by keterangan
      if (
        filter.keterangan !== "" &&
        !item.keterangan.toLowerCase().includes(filter.keterangan.toLowerCase())
      ) {
        return false;
      }

      // Filter by jenis
      if (filter.jenis !== "SEMUA" && item.jenis !== filter.jenis) {
        return false;
      }

      // Filter by sumber
      if (filter.sumber.length > 0 && !filter.sumber.includes(item.sumber)) {
        return false;
      }

      // Filter by tujuan
      if (filter.tujuan.length > 0 && !filter.tujuan.includes(item.tujuan)) {
        return false;
      }

      // Filter by nominal
      if (
        (filter.nominal_di_atas > 0 &&
          item.nominal <= filter.nominal_di_atas) ||
        (filter.nominal_di_bawah > 0 &&
          item.nominal >= filter.nominal_di_bawah) ||
        (filter.nominal_sama_dengan > 0 &&
          item.nominal !== filter.nominal_sama_dengan)
      ) {
        return false;
      }

      // Filter by bank
      if (
        filter.bank !== "SEMUA" &&
        ((filter.bank === "BANK" && !item.bank) ||
          (filter.bank === "CASH" && item.bank))
      ) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [data, filter]);

  // Memoize sorted data based on sortStatus and filtered data
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

  // Reset to first page when pageSize or sortStatus changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, sortStatus]);

  // Count total saldo
  const totalSaldo = filteredData.reduce(
    (acc, cur) =>
      acc + (cur.jenis === "PEMASUKAN" ? cur.nominal : -cur.nominal),
    0
  );

  return (
    <Flex direction="column" gap="sm">
      <MainCard transparent noPadding row>
        <Flex
          direction={isMobile ? "column" : "row"}
          justify={isMobile ? "center" : "flex-start"}
          align={isMobile ? "center" : "flex-end"}
          gap="sm"
          w="100%"
        >
          <Flex direction="column">
            <Text>Total saldo:</Text>
            <Badge color={totalSaldo > 0 ? "teal" : "red"}>
              {stringToRupiah(totalSaldo.toString())}
            </Badge>
          </Flex>
          <Button
            leftSection={<IconRestore />}
            style={{ backgroundColor: "#5177b0" }}
            onClick={() =>
              handleChangeFilter({
                tanggal_sesudah: oldestDate,
                tanggal_sebelum: new Date(),
                keterangan: "",
                jenis: "SEMUA",
                sumber: [],
                tujuan: [],
                nominal_di_bawah: 0,
                nominal_di_atas: 0,
                nominal_sama_dengan: 0,
                bank: "SEMUA",
              })
            }
          >
            Reset Filter
          </Button>
        </Flex>
        <Flex
          align="flex-end"
          justify={isMobile ? "center" : "flex-end"}
          gap="sm"
          w="100%"
        >
          <Button
            leftSection={<IconList />}
            style={{ backgroundColor: "#5177b0" }}
          >
            Daftar sumber
          </Button>
          <Button
            leftSection={<IconList />}
            style={{ backgroundColor: "#5177b0" }}
          >
            Daftar tujuan
          </Button>
        </Flex>
      </MainCard>
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
