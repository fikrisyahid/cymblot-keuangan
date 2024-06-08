"use client";

import { Text } from "@mantine/core";
import { DataTable } from "mantine-datatable";

export default function TujuanSection({
  daftarTujuan,
}: {
  daftarTujuan: {
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) {
  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <DataTable
        withTableBorder
        borderRadius="md"
        columns={[{ accessor: "tujuan" }]}
        records={daftarTujuan.map((item) => ({
          id: item.id,
          tujuan: item.nama,
        }))}
        minHeight={daftarTujuan.length === 0 ? 200 : 0}
        noRecordsText="Belum ada tujuan yang ditambahkan."
      />
    </>
  );
}
