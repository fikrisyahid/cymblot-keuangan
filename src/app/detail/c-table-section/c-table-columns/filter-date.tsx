import { DatePickerInput } from "@mantine/dates";
import { filterDetailTable } from "../../types";
import dayjs from "dayjs";
import { IconCalendar } from "@tabler/icons-react";
import { Button, Flex, rem } from "@mantine/core";

export default function FilterDate({
  filter,
  handleChangeFilter,
  oldestDate,
}: {
  filter: filterDetailTable;
  handleChangeFilter: (newObj: Partial<filterDetailTable>) => void;
  oldestDate: Date;
}) {
  return (
    <Flex direction="column" gap="sm" style={{ width: "300px" }}>
      <DatePickerInput
        label="Pilih tanggal sesudah"
        placeholder="Masukkan tanggal sesudah"
        valueFormatter={({ date }) =>
          dayjs(date?.toString()).locale("id").format("DD MMMM YYYY")
        }
        leftSection={
          <IconCalendar
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        }
        value={filter.tanggal_sesudah}
        onChange={(e) => handleChangeFilter({ tanggal_sesudah: e })}
      />
      <DatePickerInput
        label="Pilih tanggal sebelum"
        placeholder="Masukkan tanggal sebelum"
        valueFormatter={({ date }) =>
          dayjs(date?.toString()).locale("id").format("DD MMMM YYYY")
        }
        leftSection={
          <IconCalendar
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        }
        value={filter.tanggal_sebelum}
        onChange={(e) => handleChangeFilter({ tanggal_sebelum: e })}
      />
      <Button
        onClick={() =>
          handleChangeFilter({
            tanggal_sesudah: oldestDate,
            tanggal_sebelum: new Date(),
          })
        }
      >
        Reset
      </Button>
    </Flex>
  );
}
