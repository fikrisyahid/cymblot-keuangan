import stringToRupiah from "@/utils/string-to-rupiah";
import { Badge, Flex, Text } from "@mantine/core";
import dayjs from "dayjs";
import { DataTableColumn } from "mantine-datatable";
import FilterInformation from "./filter-information";
import FilterDate from "./filter-date";
import FilterSource from "./filter-source";
import FilterPurpose from "./filter-purpose";
import FilterBalance from "./filter-balance";
import FilterBank from "./filter-bank";
import FilterType from "./filter-type";
import DeleteDataKeuanganButton from "../delete-data-keuangan-button";
import { IBanks, ITujuanSumber } from "@/types/db";
import { IFilterDetailTable } from "../../types";
import EditDataKeuanganButton from "../edit-data-keuangan-button";

export default function generateDetailTableColumns({
  filter,
  handleChangeFilter,
  daftarSumber,
  daftarTujuan,
  daftarBank,
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

  const renderBank = ({ bank }: { bank: string }) => <Text>{bank}</Text>;

  const renderAction = ({ id }: { id: string }) => (
    <Flex gap="sm">
      <EditDataKeuanganButton id={id} />
      <DeleteDataKeuanganButton id={id} />
    </Flex>
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
    {
      title: "Penyimpanan",
      accessor: "bank",
      sortable: true,
      render: renderBank,
      filter: (
        <FilterBank
          filter={filter}
          handleChangeFilter={handleChangeFilter}
          daftarBank={daftarBank}
        />
      ),
    },
    {
      accessor: "action",
      render: renderAction,
      textAlign: "right",
    },
  ];

  return columnsToReturn;
}
