import { Checkbox, Flex } from "@mantine/core";
import { filterDetailTable } from "../../types";

export default function FilterType({
  filter,
  handleChangeFilter,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
}) {
  const filterTypeConfigurations = ["SEMUA", "PEMASUKAN", "PENGELUARAN"];

  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      {filterTypeConfigurations.map((jenis) => (
        <Checkbox
          key={jenis}
          label={jenis}
          checked={filter.jenis === jenis}
          onChange={(e) =>
            handleChangeFilter({
              jenis: e.currentTarget.checked ? jenis : "SEMUA",
            })
          }
        />
      ))}
    </Flex>
  );
}
