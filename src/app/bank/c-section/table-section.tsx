"use client";

import { DataTable } from "mantine-datatable";
import { ITujuanSumber } from "@/types/db";
import DeleteButton from "./delete-button";
import { Flex } from "@mantine/core";
import EditButton from "./edit-button";

export default function TableSection({
  data,
  deleteFunction,
  editFunction,
}: {
  data: ITujuanSumber[];
  deleteFunction: ({ id }: { id: string }) => Promise<void>;
  editFunction: ({ id, nama }: { id: string; nama: string }) => Promise<void>;
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
        { accessor: "bank" },
        {
          accessor: "actions",
          title: "Aksi",
          textAlign: "right",
          render: (record) => (
            <Flex gap="sm" justify="flex-end">
              <EditButton
                id={record.id}
                nama={record.bank}
                editFunction={editFunction}
              />
              <DeleteButton id={record.id} deleteFunction={deleteFunction} />
            </Flex>
          ),
        },
      ]}
      records={data.map((item, index) => ({
        id: item.id,
        number: index + 1,
        bank: item.nama,
      }))}
      minHeight={data.length === 0 ? 200 : 0}
      noRecordsText={`Belum ada bank yang ditambahkan.`}
    />
  );
}
