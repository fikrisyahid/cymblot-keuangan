import stringToRupiah from "@/utils/string-to-rupiah";
import { Badge, Text } from "@mantine/core";
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
import { ITujuanSumber } from "@/types/db";
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

  const renderAction = ({ id }: { id: string }) => (
    <DeleteDataKeuanganButton id={id} />
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
      filter: (
        <FilterInformation
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
      ),
      filtering: filter.keterangan !== "",
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
      accessor: "bank",
      sortable: true,
      render: renderBank,
      filter: (
        <FilterBank filter={filter} handleChangeFilter={handleChangeFilter} />
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
