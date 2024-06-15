import { Checkbox, Flex } from "@mantine/core";
import { IFilterDetailTable } from "../../types";

export default function FilterType({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
}) {
  const filterTypeConfigurations = ["SEMUA", "PEMASUKAN", "PENGELUARAN", "PENYETORAN", "PENARIKAN"];

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
