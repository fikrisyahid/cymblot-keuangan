import { Checkbox, Flex } from "@mantine/core";
import { IFilterGraph } from "../types";

export default function FilterType({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
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
