import { DatePickerInput, DateValue } from "@mantine/dates";
import dayjs from "dayjs";
import { IconCalendar } from "@tabler/icons-react";
import { SegmentedControl, Select, rem } from "@mantine/core";
import { IFilterGraph } from "../types";
import MainCard from "@/components/main-card";

export default function FilterDate({
  filter,
  handleChangeFilter,
}: {
  filter: IFilterGraph;
  handleChangeFilter: (newObj: Partial<IFilterGraph>) => void;
}) {
  const currentYear = dayjs().year();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  );
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const days = Array.from(
    { length: dayjs(`${filter.year}-${filter.month}`).daysInMonth() },
    (_, i) => (i + 1).toString()
  );

  const rangeDateConfigurations = [
    {
      placeholder: "Masukkan tanggal sesudah",
      value: filter.tanggal_sesudah,
      onChange: (e: DateValue) => handleChangeFilter({ tanggal_sesudah: e }),
    },
    {
      placeholder: "Masukkan tanggal sebelum",
      value: filter.tanggal_sebelum,
      onChange: (e: DateValue) => handleChangeFilter({ tanggal_sebelum: e }),
    },
  ];

  const selectConfigurations = [
    {
      condition: filter.mode === "hari",
      value: filter.day,
      onChange: (value: string | null) =>
        handleChangeFilter({ day: value as IFilterGraph["day"] }),
      data: days.map((d) => ({ value: d, label: d })),
      placeholder: "Pilih Hari",
    },
    {
      condition: filter.mode === "bulan" || filter.mode === "hari",
      value: filter.month,
      onChange: (value: string | null) =>
        handleChangeFilter({ month: value as IFilterGraph["month"] }),
      data: months.map((m) => ({
        value: m,
        label: dayjs()
          .month(parseInt(m) - 1)
          .locale("id")
          .format("MMMM"),
      })),
      placeholder: "Pilih Bulan",
    },
    {
      condition:
        filter.mode === "tahun" ||
        filter.mode === "bulan" ||
        filter.mode === "hari",
      value: filter.year,
      onChange: (value: string | null) =>
        handleChangeFilter({ year: value as IFilterGraph["year"] }),
      data: years.map((y) => ({ value: y, label: y })),
      placeholder: "Pilih Tahun",
    },
  ];

  return (
    <>
      <SegmentedControl
        value={filter.mode}
        onChange={(e) =>
          handleChangeFilter({ mode: e as IFilterGraph["mode"] })
        }
        data={[
          { label: "Range", value: "range" },
          { label: "Per Hari", value: "hari" },
          { label: "Per Bulan", value: "bulan" },
          { label: "Per Tahun", value: "tahun" },
        ]}
      />
      {filter.mode === "range" && (
        <MainCard transparent noPadding row>
          {rangeDateConfigurations.map((item, index) => (
            <DatePickerInput
              key={index}
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
        </MainCard>
      )}
      {selectConfigurations.map(
        (item, index) =>
          item.condition && (
            <Select
              key={index}
              value={item.value}
              onChange={(value) => item.onChange(value)}
              data={item.data}
              placeholder={item.placeholder}
            />
          )
      )}
    </>
  );
}
