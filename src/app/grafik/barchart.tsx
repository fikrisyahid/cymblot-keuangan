"use client";

import { ITransaksi, ITujuanSumber } from "@/types/db";
import { BarChart } from "@mantine/charts";
import { Select, SegmentedControl, Stack, rem } from "@mantine/core";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import MainCard from "@/components/main-card";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { IFilterGraph } from "./types";
import FilterType from "./c-filter/filter-type";
import FilterInformation from "./c-filter/filter-information";
import FilterSource from "./c-filter/filter-source";
import FilterPurpose from "./c-filter/filter-purpose";
import FilterBalance from "./c-filter/filter-balance";
import FilterBank from "./c-filter/filter-bank";

export default function BalanceBarChart({
  data,
  oldestDate,
  daftarSumber,
  daftarTujuan,
}: {
  data: ITransaksi[];
  oldestDate: Date;
  daftarSumber: ITujuanSumber[];
  daftarTujuan: ITujuanSumber[];
}) {
  const [mode, setMode] = useState<"range" | "hari" | "bulan" | "tahun">(
    "bulan"
  );
  const [filter, setFilter] = useState<IFilterGraph>({
    tanggal_sebelum: oldestDate,
    tanggal_sesudah: new Date(),
    keterangan: "",
    jenis: "SEMUA",
    sumber: [],
    tujuan: [],
    nominal_di_bawah: 0,
    nominal_di_atas: 0,
    nominal_sama_dengan: 0,
    bank: "SEMUA",
  });
  const handleChangeFilter = (newObj: Partial<IFilterGraph>) =>
    setFilter((old) => ({ ...old, ...newObj }));

  const [year, setYear] = useState(dayjs().year().toString());
  const [month, setMonth] = useState((dayjs().month() + 1).toString());
  const [day, setDay] = useState(dayjs().date().toString());

  const currentYear = dayjs().year();

  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  );
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const days = Array.from(
    { length: dayjs(`${year}-${month}`).daysInMonth() },
    (_, i) => (i + 1).toString()
  );

  return (
    <Stack>
      <MainCard transparent noPadding row>
        <SegmentedControl
          value={mode}
          onChange={(e) => setMode(e as "range" | "hari" | "bulan" | "tahun")}
          data={[
            { label: "Range", value: "range" },
            { label: "Per Hari", value: "hari" },
            { label: "Per Bulan", value: "bulan" },
            { label: "Per Tahun", value: "tahun" },
          ]}
        />
        {mode === "range" && (
          <MainCard transparent noPadding row>
            <DatePickerInput
              placeholder="Pilih tanggal sesudah"
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
              onChange={(e: DateValue) =>
                handleChangeFilter({ tanggal_sesudah: e })
              }
            />
            <DatePickerInput
              placeholder="Pilih tanggal sebelum"
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
              onChange={(e: DateValue) =>
                handleChangeFilter({ tanggal_sebelum: e })
              }
            />
          </MainCard>
        )}
        {mode === "hari" && (
          <Select
            value={day}
            onChange={(e) => setDay(e as string)}
            data={days.map((d) => ({ value: d, label: d }))}
            placeholder="Pilih Hari"
          />
        )}
        {(mode === "bulan" || mode === "hari") && (
          <Select
            value={month}
            onChange={(e) => setMonth(e as string)}
            data={months.map((m) => ({
              value: m,
              label: dayjs()
                .month(parseInt(m) - 1)
                .locale("id")
                .format("MMMM"),
            }))}
            placeholder="Pilih Bulan"
          />
        )}
        {(mode === "tahun" || mode === "bulan" || mode === "hari") && (
          <Select
            value={year}
            onChange={(e) => setYear(e as string)}
            data={years.map((y) => ({ value: y, label: y }))}
            placeholder="Pilih Tahun"
          />
        )}
      </MainCard>
      <MainCard transparent noPadding row>
        <FilterInformation
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
        <FilterType filter={filter} handleChangeFilter={handleChangeFilter} />
        <FilterSource
          filter={filter}
          handleChangeFilter={handleChangeFilter}
          daftarSumber={daftarSumber}
        />
        <FilterPurpose
          filter={filter}
          handleChangeFilter={handleChangeFilter}
          daftarTujuan={daftarTujuan}
        />
        <FilterBalance
          filter={filter}
          handleChangeFilter={handleChangeFilter}
        />
        <FilterBank filter={filter} handleChangeFilter={handleChangeFilter} />
      </MainCard>
      <BarChart
        h={400}
        data={[]}
        dataKey={mode === "hari" ? "hour" : mode === "bulan" ? "day" : "month"}
        series={[]}
        tickLine="y"
      />
    </Stack>
  );
}
