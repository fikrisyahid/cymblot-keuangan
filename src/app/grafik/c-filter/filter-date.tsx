import { DatePickerInput, DateValue } from "@mantine/dates";
import dayjs from "dayjs";
import { IconCalendar } from "@tabler/icons-react";
import { Button, Flex, rem } from "@mantine/core";
import { IFilterGraph } from "../types";

export default function FilterDate({
  filter,
  handleChangeFilter,
  oldestDate,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
  oldestDate: Date;
}) {
  const filterDateConfigurations = [
    {
      label: "Pilih tanggal sesudah",
      placeholder: "Masukkan tanggal sesudah",
      value: filter.tanggal_sesudah,
      onChange: (e: DateValue) => handleChangeFilter({ tanggal_sesudah: e }),
    },
    {
      label: "Pilih tanggal sebelum",
      placeholder: "Masukkan tanggal sebelum",
      value: filter.tanggal_sebelum,
      onChange: (e: DateValue) => handleChangeFilter({ tanggal_sebelum: e }),
    },
  ];

  return (
    <Flex direction="column" gap="sm" style={{ width: "300px" }}>
      {filterDateConfigurations.map((item) => (
        <DatePickerInput
          key={item.label}
          label={item.label}
          placeholder={item.placeholder}
          valueFormatter={({ date }) =>
            dayjs(date?.toString()).locale("id").format("DD MMMM YYYY")
          }
          leftSection={
            <IconCalendar
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          }
          value={item.value}
          onChange={item.onChange}
        />
      ))}
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
