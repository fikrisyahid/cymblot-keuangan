import BaseTable from "@/components/base-table";

export default function Page() {
  return (
    <>
      <BaseTable
        columns={[
          { accessor: "id" },
          { accessor: "name" },
          { accessor: "bornIn", width: 150 },
          { accessor: "party" },
        ]}
        records={[
          { id: 1, name: "Joe Biden", bornIn: 1942, party: "Democratic" },
          { id: 1, name: "Joe awd", bornIn: 1942, party: "Democratic" },
        ]}
      />
    </>
  );
}
