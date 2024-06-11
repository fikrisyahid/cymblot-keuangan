import { Checkbox, Flex } from "@mantine/core";
import { IFilterGraph } from "../types";

export default function FilterBank({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
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
