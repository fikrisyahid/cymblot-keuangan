"use client";

import { Text } from "@mantine/core";
import { DataTable } from "mantine-datatable";

export default function SumberSection({
  daftarSumber,
}: {
  daftarSumber: {
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) {
  return (
    <>
      <Text fw={700}>Daftar Sumber</Text>
      <DataTable
        withTableBorder
        borderRadius="md"
        columns={[{ accessor: "sumber" }]}
        records={daftarSumber.map((item) => ({
          id: item.id,
          sumber: item.nama,
        }))}
        minHeight={daftarSumber.length === 0 ? 200 : 0}
        noRecordsText="Belum ada sumber yang ditambahkan."
      />
    </>
  );
}
