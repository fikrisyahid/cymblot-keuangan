"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import { ActionIcon, Badge, Text, TextInput } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { IconSearch, IconX } from "@tabler/icons-react";

const PAGE_SIZES = [10, 15, 20];

export default function DetailTable({ data }: { data: any[] }) {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    keterangan: "",
  });
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "tanggal",
    direction: "asc",
  });

  const handleChangeFilter = (newObj: any) =>
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
      withTableBorder
      records={paginatedRecords}
      columns={[
        { accessor: "no", sortable: true },
        { accessor: "tanggal", sortable: true },
        {
          accessor: "keterangan",
          sortable: true,
          filter: (
            <TextInput
              label="Keterangan"
              description="Filter data keuangan berdasarkan keterangan"
              placeholder="Masukkan keterangan..."
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
        },
        { accessor: "sumber", sortable: true },
        { accessor: "tujuan", sortable: true },
        {
          accessor: "nominal",
          render: ({ nominal }: { nominal: string }) => (
            <Text>{stringToRupiah(nominal)}</Text>
          ),
          sortable: true,
        },
        { accessor: "bank", sortable: true },
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
