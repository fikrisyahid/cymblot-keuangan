import { Checkbox, Flex } from "@mantine/core";
import { filterDetailTable } from "../../types";

export default function FilterKind({
  filter,
  handleChangeFilter,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
}) {
  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      <Checkbox
        label="SEMUA"
        checked={filter.jenis === "SEMUA"}
        onChange={(e) =>
          handleChangeFilter({
            jenis: e.currentTarget.checked ? "SEMUA" : "SEMUA",
          })
        }
      />
      <Checkbox
        label="PEMASUKAN"
        checked={filter.jenis === "PEMASUKAN"}
        onChange={(e) =>
          handleChangeFilter({
            jenis: e.currentTarget.checked ? "PEMASUKAN" : "SEMUA",
          })
        }
      />
      <Checkbox
        label="PENGELUARAN"
        checked={filter.jenis === "PENGELUARAN"}
        onChange={(e) =>
          handleChangeFilter({
            jenis: e.currentTarget.checked ? "PENGELUARAN" : "SEMUA",
          })
        }
      />
    </Flex>
  );
}
