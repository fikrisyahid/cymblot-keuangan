"use client";

import { DataTable } from "mantine-datatable";
import DeleteSumberButton from "./delete-sumber-button";

export default function TableSumber({
  daftarSumber,
  deleteSumber,
}: {
  daftarSumber: {
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  deleteSumber: (id: string) => void;
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
        { accessor: "sumber", title: "Sumber" },
        {
          accessor: "actions",
          title: "Aksi",
          textAlign: "right",
          render: (record) => (
            <DeleteSumberButton id={record.id} deleteSumber={deleteSumber} />
          ),
        },
      ]}
      records={daftarSumber.map((item, index) => ({
        id: item.id,
        number: index + 1,
        sumber: item.nama,
      }))}
      minHeight={daftarSumber.length === 0 ? 200 : 0}
      noRecordsText="Belum ada sumber yang ditambahkan."
    />
  );
}
