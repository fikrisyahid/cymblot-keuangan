"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Checkbox,
  Flex,
  NumberInput,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import stringToRupiah from "@/utils/string-to-rupiah";
import {
  IconCalendar,
  IconInfoCircle,
  IconList,
  IconRestore,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { filterDetailTable } from "./types";
import { TEXT_COLOR } from "@/config";

const PAGE_SIZES = [10, 25, 50, 75, 100];

export default function DetailTable({
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
  const [pageSize, setPageSize] = useState(PAGE_SIZES[2]);
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
      <Flex justify="space-between" align="flex-end">
        <Flex align="flex-end" gap="sm">
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
        <Flex justify="flex-end" gap="sm">
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
      </Flex>
      <DataTable
        minHeight={filteredData.length === 0 ? 200 : 0}
        withTableBorder
        records={paginatedRecords}
        style={{ color: TEXT_COLOR }}
        columns={[
          { accessor: "no", sortable: true },
          {
            accessor: "tanggal",
            sortable: true,
            render: ({ tanggal }) => (
              <Text>
                {dayjs(tanggal).locale("id").format("DD MMMM YYYY pukul H:m:s")}
              </Text>
            ),
            filter: (
              <Flex direction="column" gap="sm" style={{ width: "300px" }}>
                <DatePickerInput
                  label="Pilih tanggal sesudah"
                  placeholder="Masukkan tanggal sesudah"
                  valueFormatter={({ date }) =>
                    dayjs(date?.toString()).locale("id").format("DD MMMM YYYY")
                  }
                  leftSection={
                    <IconCalendar
                      style={{ width: rem(18), height: rem(18) }}
                      stroke={1.5}
                    />
                  }
                  value={filter.tanggal_sesudah}
                  onChange={(e) => handleChangeFilter({ tanggal_sesudah: e })}
                />
                <DatePickerInput
                  label="Pilih tanggal sebelum"
                  placeholder="Masukkan tanggal sebelum"
                  valueFormatter={({ date }) =>
                    dayjs(date?.toString()).locale("id").format("DD MMMM YYYY")
                  }
                  leftSection={
                    <IconCalendar
                      style={{ width: rem(18), height: rem(18) }}
                      stroke={1.5}
                    />
                  }
                  value={filter.tanggal_sebelum}
                  onChange={(e) => handleChangeFilter({ tanggal_sebelum: e })}
                />
                <Button
                  onClick={() =>
                    handleChangeFilter({
                      tanggal_sesudah: oldestDate,
                      tanggal_sebelum: new Date(),
                    })
                  }
                >
                  Reset
                </Button>
              </Flex>
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
              <Badge color={jenis === "PEMASUKAN" ? "teal" : "pink"}>
                {jenis}
              </Badge>
            ),
            sortable: true,
            filter: (
              <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
                <Checkbox
                  label="SEMUA"
                  checked={filter.jenis === "SEMUA"}
                  onChange={(e) =>
                    handleChangeFilter({
                      jenis: e.currentTarget.checked ? "SEMUA" : "SEMUA",
                    })
                  }
                />
                <Checkbox
                  label="PEMASUKAN"
                  checked={filter.jenis === "PEMASUKAN"}
                  onChange={(e) =>
                    handleChangeFilter({
                      jenis: e.currentTarget.checked ? "PEMASUKAN" : "SEMUA",
                    })
                  }
                />
                <Checkbox
                  label="PENGELUARAN"
                  checked={filter.jenis === "PENGELUARAN"}
                  onChange={(e) =>
                    handleChangeFilter({
                      jenis: e.currentTarget.checked ? "PENGELUARAN" : "SEMUA",
                    })
                  }
                />
              </Flex>
            ),
          },
          {
            accessor: "sumber",
            sortable: true,
            filter: (
              <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
                {daftarSumber.map((item) => (
                  <Checkbox
                    key={item.id}
                    label={item.nama}
                    checked={filter.sumber.includes(item.nama)}
                    disabled={filter.tujuan.length > 0}
                    onChange={(e) =>
                      handleChangeFilter({
                        sumber: e.currentTarget.checked
                          ? [...filter.sumber, item.nama]
                          : filter.sumber.filter((x) => x !== item.nama),
                      })
                    }
                  />
                ))}
                {filter.sumber.length > 0 && (
                  <Button onClick={() => handleChangeFilter({ sumber: [] })}>
                    Batalkan filter
                  </Button>
                )}
                {filter.tujuan.length > 0 && (
                  <Alert
                    variant="filled"
                    color="red"
                    title="Peringatan"
                    icon={<IconInfoCircle />}
                    p="xs"
                    style={{ maxWidth: "300px" }}
                  >
                    Kamu tidak bisa memiliki filter sumber dan tujuan secara
                    bersamaan. Silakan batalkan filter tujuan terlebih dahulu
                  </Alert>
                )}
                {daftarSumber.length === 0 && (
                  <Alert
                    variant="filled"
                    color="indigo"
                    title="Info"
                    icon={<IconInfoCircle />}
                    p="xs"
                    style={{ maxWidth: "300px" }}
                  >
                    Kamu belum memiliki sumber keuangan. Silakan tambahkan
                    sumber
                  </Alert>
                )}
              </Flex>
            ),
          },
          {
            accessor: "tujuan",
            sortable: true,
            filter: (
              <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
                {daftarTujuan.map((item) => (
                  <Checkbox
                    key={item.id}
                    label={item.nama}
                    checked={filter.tujuan.includes(item.nama)}
                    disabled={filter.sumber.length > 0}
                    onChange={(e) =>
                      handleChangeFilter({
                        tujuan: e.currentTarget.checked
                          ? [...filter.tujuan, item.nama]
                          : filter.tujuan.filter((x) => x !== item.nama),
                      })
                    }
                  />
                ))}
                {filter.tujuan.length > 0 && (
                  <Button onClick={() => handleChangeFilter({ tujuan: [] })}>
                    Batalkan filter
                  </Button>
                )}
                {filter.sumber.length > 0 && (
                  <Alert
                    variant="filled"
                    color="red"
                    title="Peringatan"
                    icon={<IconInfoCircle />}
                    p="xs"
                    style={{ maxWidth: "300px" }}
                  >
                    Kamu tidak bisa memiliki filter tujuan dan sumber secara
                    bersamaan. Silakan batalkan filter sumber terlebih dahulu
                  </Alert>
                )}
                {daftarTujuan.length === 0 && (
                  <Alert
                    variant="filled"
                    color="indigo"
                    title="Info"
                    icon={<IconInfoCircle />}
                    p="xs"
                    style={{ maxWidth: "300px" }}
                  >
                    Kamu belum memiliki tujuan keuangan. Silakan tambahkan
                    tujuan
                  </Alert>
                )}
              </Flex>
            ),
          },
          {
            accessor: "nominal",
            render: ({ nominal }: { nominal: string }) => (
              <Text>{stringToRupiah(nominal.toString())}</Text>
            ),
            sortable: true,
            filter: (
              <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
                <NumberInput
                  label="Filter keuangan di atas nominal"
                  description="Filter data keuangan di atas nominal tertentu"
                  placeholder="Masukkan nominal di sini"
                  thousandSeparator=","
                  value={filter.nominal_di_atas}
                  prefix="Rp"
                  allowNegative={false}
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
                  allowNegative={false}
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
                  allowNegative={false}
                  onChange={(value) =>
                    handleChangeFilter({ nominal_sama_dengan: +value })
                  }
                />
                {(filter.nominal_di_atas > 0 ||
                  filter.nominal_di_bawah > 0 ||
                  filter.nominal_sama_dengan > 0) && (
                  <Button
                    onClick={() =>
                      handleChangeFilter({
                        nominal_di_atas: 0,
                        nominal_di_bawah: 0,
                        nominal_sama_dengan: 0,
                      })
                    }
                  >
                    Reset
                  </Button>
                )}
              </Flex>
            ),
          },
          {
            accessor: "bank",
            sortable: true,
            render: ({ bank }) => <Text>{bank ? "Ya" : "Tidak"}</Text>,
            filter: (
              <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
                <Checkbox
                  label="SEMUA"
                  checked={filter.bank === "SEMUA"}
                  onChange={(e) =>
                    handleChangeFilter({
                      bank: e.currentTarget.checked ? "SEMUA" : "SEMUA",
                    })
                  }
                />
                <Checkbox
                  label="BANK"
                  checked={filter.bank === "BANK"}
                  onChange={(e) =>
                    handleChangeFilter({
                      bank: e.currentTarget.checked ? "BANK" : "SEMUA",
                    })
                  }
                />
                <Checkbox
                  label="CASH"
                  checked={filter.bank === "CASH"}
                  onChange={(e) =>
                    handleChangeFilter({
                      bank: e.currentTarget.checked ? "CASH" : "SEMUA",
                    })
                  }
                />
              </Flex>
            ),
          },
        ]}
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
