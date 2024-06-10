"use client";

import { DataTable } from "mantine-datatable";
import { ITujuanSumber } from "@/types/db";
import DeleteButton from "./delete-button";

export default function TableSection({
  data,
  type,
  deleteFunction,
}: {
  data: ITujuanSumber[];
  type: "sumber" | "tujuan";
  deleteFunction: (id: string) => Promise<void>;
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
        { accessor: type },
        {
          accessor: "actions",
          title: "Aksi",
          textAlign: "right",
          render: (record) => (
            <DeleteButton
              id={record.id}
              deleteFunction={deleteFunction}
              type={type}
            />
          ),
        },
      ]}
      records={data.map((item, index) => ({
        id: item.id,
        number: index + 1,
        [`${type}`]: item.nama,
      }))}
      minHeight={data.length === 0 ? 200 : 0}
      noRecordsText={`Belum ada ${type} yang ditambahkan.`}
    />
  );
}
