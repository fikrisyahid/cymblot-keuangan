"use client";

import { DataTable } from "mantine-datatable";

export default function Page() {
  return (
    <>
      <DataTable
        withTableBorder
        borderRadius="md"
        columns={[
          { accessor: "id" },
          { accessor: "name" },
          { accessor: "bornIn", width: 150 },
          { accessor: "party" },
        ]}
        records={[
          { id: 1, name: "Joe Biden", bornIn: 1942, party: "Democratic" },
        ]}
      />
    </>
  );
}
