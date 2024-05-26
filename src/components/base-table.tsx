"use client";

import { DataTable } from "mantine-datatable";

export default function BaseTable({
  columns,
  records,
}: {
  columns: any[];
  records: any[];
}) {
  return (
    <>
      <DataTable
        withTableBorder
        borderRadius="md"
        columns={columns}
        records={records}
        noRecordsText="Tidak ada data yang ditemukan"
        minHeight={150}
      />
    </>
  );
}
