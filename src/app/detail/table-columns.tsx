import stringToRupiah from "@/utils/string-to-rupiah";
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
import {
  IconCalendar,
  IconInfoCircle,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { filterDetailTable } from "./types";
import { DataTableColumn } from "mantine-datatable";

export default function generateDetailTableColumns({
  filter,
  handleChangeFilter,
  daftarSumber,
  daftarTujuan,
  oldestDate,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
  daftarSumber: any[];
  daftarTujuan: any[];
  oldestDate: Date;
}): DataTableColumn<any>[] {
  const renderTanggal = ({ tanggal }: { tanggal: Date }) => (
    <Text>
      {dayjs(tanggal).locale("id").format("DD MMMM YYYY pukul H:m:s")}
    </Text>
  );

  const renderJenis = ({ jenis }: { jenis: string }) => (
    <Badge color={jenis === "PEMASUKAN" ? "teal" : "pink"}>{jenis}</Badge>
  );

  const renderNominal = ({ nominal }: { nominal: number }) => (
    <Text>{stringToRupiah(nominal.toString())}</Text>
  );

  const renderBank = ({ bank }: { bank: string }) => (
    <Text>{bank ? "Ya" : "Tidak"}</Text>
  );

  const columnsToReturn: DataTableColumn<any>[] = [
    { accessor: "no", sortable: true },
    {
      accessor: "tanggal",
      sortable: true,
      render: renderTanggal,
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
      render: renderJenis,
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
                    : filter.sumber.filter((x: string) => x !== item.nama),
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
                    : filter.tujuan.filter((x: string) => x !== item.nama),
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
              Kamu belum memiliki tujuan keuangan. Silakan tambahkan tujuan
            </Alert>
          )}
        </Flex>
      ),
    },
    {
      accessor: "nominal",
      render: renderNominal,
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
      render: renderBank,
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
  ];

  return columnsToReturn;
}
