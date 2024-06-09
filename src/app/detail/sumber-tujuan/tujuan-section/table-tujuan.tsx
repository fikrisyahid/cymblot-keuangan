"use client";

import { DataTable } from "mantine-datatable";
import DeleteTujuanButton from "./delete-tujuan-button";

export default function TableTujuan({
  daftarTujuan,
  deleteTujuan,
}: {
  daftarTujuan: {
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  deleteTujuan: (id: string) => void;
}) {
  return (
    <DataTable
      withTableBorder
      borderRadius="md"
      columns={[
        {
          accessor: "number",
          title: "No.",
          render: (_, index) => index + 1,
          width: 45,
        },
        { accessor: "tujuan", title: "Tujuan" },
        {
          accessor: "actions",
          title: "Aksi",
          textAlign: "right",
          render: (record) => (
            <DeleteTujuanButton id={record.id} deleteTujuan={deleteTujuan} />
          ),
        },
      ]}
      records={daftarTujuan.map((item, index) => ({
        id: item.id,
        number: index + 1,
        tujuan: item.nama,
      }))}
      minHeight={daftarTujuan.length === 0 ? 200 : 0}
      noRecordsText="Belum ada tujuan yang ditambahkan."
    />
  );
}
