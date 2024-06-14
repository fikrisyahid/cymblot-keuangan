import { Checkbox, Flex } from "@mantine/core";
import { IFilterDetailTable } from "../../types";
import { IBanks } from "@/types/db";

export default function FilterBank({
  filter,
  handleChangeFilter,
  daftarBank,
}: {
  filter: IFilterDetailTable;
  handleChangeFilter: (newObj: Partial<IFilterDetailTable>) => void;
  daftarBank: IBanks[];
}) {
  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      {daftarBank.map((item) => (
        <Checkbox
          key={item.id}
          label={item.nama}
          checked={filter.bank.includes(item.nama)}
          disabled={filter.sumber.length > 0}
          onChange={(e) =>
            handleChangeFilter({
              bank: e.currentTarget.checked
                ? [...filter.bank, item.nama]
                : filter.bank.filter((x: string) => x !== item.nama),
            })
          }
        />
      ))}
      <Checkbox
        label="Cash"
        checked={filter.bank.includes("Cash")}
        disabled={filter.sumber.length > 0}
        onChange={(e) =>
          handleChangeFilter({
            bank: e.currentTarget.checked
              ? [...filter.bank, "Cash"]
              : filter.bank.filter((x: string) => x !== "Cash"),
          })
        }
      />
    </Flex>
  );
}
