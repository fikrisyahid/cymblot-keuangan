import { Button, Flex, NumberInput, Text } from "@mantine/core";
import { IFilterGraph } from "../types";

export default function FilterBalance({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
}) {
  const filterBalanceActive =
    filter.nominal_di_atas > 0 ||
    filter.nominal_di_bawah > 0 ||
    filter.nominal_sama_dengan > 0;

  const filterConfigurations = [
    {
      label: "Filter keuangan di atas nominal",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_di_atas,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_di_atas: +value }),
    },
    {
      label: "Filter keuangan di bawah nominal",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_di_bawah,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_di_bawah: +value }),
    },
    {
      label: "Filter keuangan pada nominal",
      placeholder: "Masukkan nominal di sini",
      value: filter.nominal_sama_dengan,
      onChange: (value: string | number) =>
        handleChangeFilter({ nominal_sama_dengan: +value }),
    },
  ];

  return (
    <Flex direction="column" gap="sm">
      <Text fw={700}>Jumlah Nominal</Text>
      {filterConfigurations.map((input) => (
        <NumberInput
          key={input.label}
          label={input.label}
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
