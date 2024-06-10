import { Checkbox, Flex } from "@mantine/core";
import { IFilterDetailTable } from "../../types";

export default function FilterBank({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
}) {
  const filterBankConfiguration = ["SEMUA", "BANK", "CASH"];

  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      {filterBankConfiguration.map((option) => (
        <Checkbox
          key={option}
          label={option}
          checked={filter.bank === option}
          onChange={(e) =>
            handleChangeFilter({
              bank: e.currentTarget.checked ? option : "SEMUA",
            })
          }
        />
      ))}
    </Flex>
  );
}
