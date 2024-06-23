import stringToRupiah from "@/utils/string-to-rupiah";
import { Badge, Text } from "@mantine/core";
import dayjs from "dayjs";
import { DataTableColumn } from "mantine-datatable";
import FilterInformation from "./filter-information";
import FilterDate from "./filter-date";
import FilterSource from "./filter-source";
import FilterPurpose from "./filter-purpose";
import FilterBalance from "./filter-balance";
import FilterType from "./filter-type";
import { IBanks, ITujuanSumber } from "@/types/db";
import { IFilterDetailTable } from "../../types";

export default function generateDetailTableColumns({
  filter,
  handleChangeFilter,
  daftarSumber,
  daftarTujuan,
  oldestDate,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
  daftarSumber: ITujuanSumber[];
  daftarTujuan: ITujuanSumber[];
  daftarBank: IBanks[];
  oldestDate: Date;
}): DataTableColumn<any>[] {
  const renderTanggal = ({ tanggal }: { tanggal: Date }) => (
    <Text>
      {dayjs(tanggal).locale("id").format("DD MMMM YYYY pukul H:m:s")}
    </Text>
  );

  const renderKeterangan = ({ keterangan }: { keterangan: string }) => (
    <Text style={{ whiteSpace: "pre-wrap" }}>{keterangan}</Text>
  );

  const renderJenis = ({ jenis }: { jenis: string }) => (
    <Badge
      color={
        jenis === "PEMASUKAN"
          ? "teal"
          : jenis === "PENARIKAN" || jenis === "PENYETORAN"
          ? "violet"
          : "pink"
      }
    >
      {jenis}
    </Badge>
  );

  const renderNominal = ({ nominal }: { nominal: number }) => (
    <Text>{stringToRupiah(nominal.toString())}</Text>
  );

  const columnsToReturn: DataTableColumn<any>[] = [
    { accessor: "no", sortable: true },
    {
      accessor: "tanggal",
      sortable: true,
      render: renderTanggal,
      filter: (
        <FilterDate
          filter={filter}
          handleChangeFilter={handleChangeFilter}
          oldestDate={oldestDate}
        />
      ),
    },
    {
      accessor: "keterangan",
      sortable: true,
      render: renderKeterangan,
      filter: (
        <FilterInformation
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
      ),
    },
    {
      accessor: "jenis",
      render: renderJenis,
      sortable: true,
      filter: (
        <FilterType filter={filter} handleChangeFilter={handleChangeFilter} />
      ),
    },
    {
      accessor: "sumber",
      sortable: true,
      filter: (
        <FilterSource
          daftarSumber={daftarSumber}
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
      ),
    },
    {
      accessor: "tujuan",
      sortable: true,
      filter: (
        <FilterPurpose
          daftarTujuan={daftarTujuan}
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
      ),
    },
    {
      accessor: "nominal",
      render: renderNominal,
      sortable: true,
      filter: (
        <FilterBalance
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
      ),
    },
  ];

  return columnsToReturn;
}
