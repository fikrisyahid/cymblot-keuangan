"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  Alert,
  Badge,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { IconInfoCircle, IconSearch, IconX } from "@tabler/icons-react";
import moment from "moment";
import "moment/locale/id";
import { filterDetailTable } from "./types";

const PAGE_SIZES = [10, 15, 20];

export default function DetailTable({
  data,
  daftarSumber,
  daftarTujuan,
}: {
  data: any[];
  daftarSumber: any[];
  daftarTujuan: any[];
}) {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<filterDetailTable>({
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
        (filter.nominal_di_atas > 0 && item.nominal < filter.nominal_di_atas) ||
        (filter.nominal_di_bawah > 0 &&
          item.nominal > filter.nominal_di_bawah) ||
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

  return (
    <DataTable
      minHeight={data.length === 0 ? 200 : 0}
      withTableBorder
      records={paginatedRecords}
      columns={[
        { accessor: "no", sortable: true },
        {
          accessor: "tanggal",
          sortable: true,
          render: ({ tanggal }) => (
            <Text>{moment(tanggal).format("LLLL")}</Text>
          ),
        },
        {
          accessor: "keterangan",
          sortable: true,
          filter: (
            <TextInput
              label="Keterangan"
              description="Filter data keuangan berdasarkan keterangan"
              placeholder="Masukkan keterangan"
              leftSection={<IconSearch size={16} />}
              rightSection={
                <ActionIcon
                  size="sm"
                  variant="transparent"
                  c="dimmed"
                  onClick={() => handleChangeFilter({ keterangan: "" })}
                >
                  <IconX size={14} />
                </ActionIcon>
              }
              value={filter.keterangan}
              onChange={(e) =>
                handleChangeFilter({ keterangan: e.currentTarget.value })
              }
            />
          ),
          filtering: filter.keterangan !== "",
        },
        {
          accessor: "jenis",
          render: ({ jenis }: { jenis: string }) => (
            <Badge color={jenis === "PEMASUKAN" ? "lime" : "pink"}>
              {jenis}
            </Badge>
          ),
          sortable: true,
          filter: (
            <Select
              label="Pilih jenis transaksi"
              description="Filter data keuangan berdasarkan jenis transaksi"
              checkIconPosition="left"
              data={[
                { value: "SEMUA", label: "Semua" },
                { value: "PEMASUKAN", label: "Pemasukan" },
                { value: "PENGELUARAN", label: "Pengeluaran" },
              ]}
              value={filter.jenis}
              onChange={(value) =>
                handleChangeFilter({ jenis: value || "SEMUA" })
              }
            />
          ),
        },
        {
          accessor: "sumber",
          sortable: true,
          filter: (
            <Flex direction="column" gap="sm">
              <MultiSelect
                clearable
                placeholder="Pilih sumber keuangan"
                label="Pilih sumber keuangan"
                description="Filter data keuangan berdasarkan sumber keuangan"
                checkIconPosition="left"
                data={daftarSumber.map((item) => item.nama)}
                value={filter.sumber}
                onChange={(value) => handleChangeFilter({ sumber: value })}
                style={{ minWidth: 200 }}
                disabled={daftarSumber.length === 0}
              />
              {daftarSumber.length === 0 && (
                <Alert
                  variant="filled"
                  color="indigo"
                  title="Alert title"
                  icon={<IconInfoCircle />}
                  p="xs"
                >
                  Kamu belum memiliki sumber keuangan. Silakan tambahkan sumber
                </Alert>
              )}
            </Flex>
          ),
        },
        {
          accessor: "tujuan",
          sortable: true,
          filter: (
            <Flex direction="column" gap="sm">
              <MultiSelect
                clearable
                placeholder="Pilih tujuan keuangan"
                label="Pilih tujuan keuangan"
                description="Filter data keuangan berdasarkan tujuan keuangan"
                checkIconPosition="left"
                data={daftarTujuan.map((item) => item.nama)}
                value={filter.tujuan}
                onChange={(value) => handleChangeFilter({ tujuan: value })}
                style={{ minWidth: 200 }}
                disabled={daftarTujuan.length === 0}
              />
              {daftarTujuan.length === 0 && (
                <Alert
                  variant="filled"
                  color="indigo"
                  title="Alert title"
                  icon={<IconInfoCircle />}
                  p="xs"
                >
                  Kamu belum memiliki tujuan keuangan. Silakan tambahkan tujuan
                </Alert>
              )}
            </Flex>
          ),
        },
        {
          accessor: "nominal",
          render: ({ nominal }: { nominal: string }) => (
            <Text>{stringToRupiah(nominal)}</Text>
          ),
          sortable: true,
          filter: (
            <Flex direction="column" gap="sm">
              <NumberInput
                label="Filter keuangan di atas nominal"
                description="Filter data keuangan di atas nominal tertentu"
                placeholder="Masukkan nominal di sini"
                thousandSeparator=","
                value={filter.nominal_di_atas}
                prefix="Rp"
                onChange={(value) =>
                  handleChangeFilter({ nominal_di_atas: +value })
                }
              />
              <NumberInput
                label="Filter keuangan di bawah nominal"
                description="Filter data keuangan di bawah nominal tertentu"
                placeholder="Masukkan nominal di sini"
                thousandSeparator=","
                value={filter.nominal_di_bawah}
                prefix="Rp"
                onChange={(value) =>
                  handleChangeFilter({ nominal_di_bawah: +value })
                }
              />
              <NumberInput
                label="Filter keuangan pada nominal"
                description="Filter data keuangan pada nominal tertentu"
                placeholder="Masukkan nominal di sini"
                thousandSeparator=","
                value={filter.nominal_sama_dengan}
                prefix="Rp"
                onChange={(value) =>
                  handleChangeFilter({ nominal_sama_dengan: +value })
                }
              />
            </Flex>
          ),
        },
        {
          accessor: "bank",
          sortable: true,
          render: ({ bank }) => <Text>{bank ? "Ya" : "Tidak"}</Text>,
          filter: (
            <Select
              label="Pilih jenis metode penyimpanan uang"
              description="Filter data keuangan berdasarkan metode penyimpanan uang"
              checkIconPosition="left"
              data={[
                { value: "SEMUA", label: "Semua" },
                { value: "BANK", label: "Bank" },
                { value: "CASH", label: "Cash" },
              ]}
              value={filter.bank}
              onChange={(value) =>
                handleChangeFilter({ bank: value || "SEMUA" })
              }
            />
          ),
        },
      ]}
      totalRecords={data.length}
      borderRadius="md"
      recordsPerPage={pageSize}
      page={page}
      onPageChange={(p) => setPage(p)}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={setPageSize}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
    />
  );
}
