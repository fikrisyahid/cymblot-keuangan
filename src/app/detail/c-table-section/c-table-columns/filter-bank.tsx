import { Checkbox, Flex } from "@mantine/core";
import { filterDetailTable } from "../../types";

export default function FilterBank({
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
        checked={filter.bank === "SEMUA"}
        onChange={(e) =>
          handleChangeFilter({
            bank: e.currentTarget.checked ? "SEMUA" : "SEMUA",
          })
        }
      />
      <Checkbox
        label="BANK"
        checked={filter.bank === "BANK"}
        onChange={(e) =>
          handleChangeFilter({
            bank: e.currentTarget.checked ? "BANK" : "SEMUA",
          })
        }
      />
      <Checkbox
        label="CASH"
        checked={filter.bank === "CASH"}
        onChange={(e) =>
          handleChangeFilter({
            bank: e.currentTarget.checked ? "CASH" : "SEMUA",
          })
        }
      />
    </Flex>
  );
}
