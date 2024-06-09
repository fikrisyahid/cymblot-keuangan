import { Button, Flex, NumberInput } from "@mantine/core";
import { filterDetailTable } from "../../types";

export default function FilterBalance({
  filter,
  handleChangeFilter,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
}) {
  const filterBalanceActive =
    filter.nominal_di_atas > 0 ||
    filter.nominal_di_bawah > 0 ||
    filter.nominal_sama_dengan > 0;

  const filterConfigurations = [
    {
      label: "Filter keuangan di atas nominal",
      description: "Filter data keuangan di atas nominal tertentu",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_di_atas,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_di_atas: +value }),
    },
    {
      label: "Filter keuangan di bawah nominal",
      description: "Filter data keuangan di bawah nominal tertentu",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_di_bawah,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_di_bawah: +value }),
    },
    {
      label: "Filter keuangan pada nominal",
      description: "Filter data keuangan pada nominal tertentu",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_sama_dengan,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_sama_dengan: +value }),
    },
  ];

  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      {filterConfigurations.map((input) => (
        <NumberInput
          key={input.label}
          label={input.label}
          description={input.description}
          placeholder={input.placeholder}
          thousandSeparator=","
          value={input.value}
          prefix="Rp"
          allowNegative={false}
          onChange={input.onChange}
        />
      ))}
      {filterBalanceActive && (
        <Button
          onClick={() =>
            handleChangeFilter({
              nominal_di_atas: 0,
              nominal_di_bawah: 0,
              nominal_sama_dengan: 0,
            })
          }
        >
          Reset
        </Button>
      )}
    </Flex>
  );
}
