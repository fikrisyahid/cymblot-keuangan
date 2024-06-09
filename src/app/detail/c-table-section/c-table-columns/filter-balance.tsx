import { Button, Flex, NumberInput } from "@mantine/core";
import { filterDetailTable } from "../../types";

export default function FilterBalance({
  filter,
  handleChangeFilter,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
}) {
  return (
    <Flex direction="column" gap="sm" style={{ maxWidth: "300px" }}>
      <NumberInput
        label="Filter keuangan di atas nominal"
        description="Filter data keuangan di atas nominal tertentu"
        placeholder="Masukkan nominal di sini"
        thousandSeparator=","
        value={filter.nominal_di_atas}
        prefix="Rp"
        allowNegative={false}
        onChange={(value) => handleChangeFilter({ nominal_di_atas: +value })}
      />
      <NumberInput
        label="Filter keuangan di bawah nominal"
        description="Filter data keuangan di bawah nominal tertentu"
        placeholder="Masukkan nominal di sini"
        thousandSeparator=","
        value={filter.nominal_di_bawah}
        prefix="Rp"
        allowNegative={false}
        onChange={(value) => handleChangeFilter({ nominal_di_bawah: +value })}
      />
      <NumberInput
        label="Filter keuangan pada nominal"
        description="Filter data keuangan pada nominal tertentu"
        placeholder="Masukkan nominal di sini"
        thousandSeparator=","
        value={filter.nominal_sama_dengan}
        prefix="Rp"
        allowNegative={false}
        onChange={(value) =>
          handleChangeFilter({ nominal_sama_dengan: +value })
        }
      />
      {(filter.nominal_di_atas > 0 ||
        filter.nominal_di_bawah > 0 ||
        filter.nominal_sama_dengan > 0) && (
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
