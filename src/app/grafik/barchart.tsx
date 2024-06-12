"use client";

import { ITransaksi, ITujuanSumber } from "@/types/db";
import { BarChart } from "@mantine/charts";
import { Spoiler, Stack } from "@mantine/core";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import MainCard from "@/components/main-card";
import { IFilterGraph } from "./types";
import FilterType from "./c-filter/filter-type";
import FilterInformation from "./c-filter/filter-information";
import FilterSource from "./c-filter/filter-source";
import FilterPurpose from "./c-filter/filter-purpose";
import FilterBalance from "./c-filter/filter-balance";
import FilterBank from "./c-filter/filter-bank";
import FilterDate from "./c-filter/filter-date";
import {
  matchBalance,
  matchBank,
  matchDate,
  matchInformation,
  matchPurpose,
  matchSource,
  matchType,
} from "./filter";
import PrettyJSON from "@/components/pretty-json";

export default function MainBarChart({
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
  const [filter, setFilter] = useState<IFilterGraph>({
    mode: "bulan",
    year: dayjs().year().toString(),
    month: (dayjs().month() + 1).toString(),
    day: dayjs().date().toString(),
    tanggal_sebelum: new Date(),
    tanggal_sesudah: oldestDate,
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

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          matchDate({ item, filter }) &&
          matchType({ item, filter }) &&
          matchInformation({ item, filter }) &&
          matchSource({ item, filter }) &&
          matchPurpose({ item, filter }) &&
          matchBalance({ item, filter }) &&
          matchBank({ item, filter })
      ),
    [data, filter]
  );

  return (
    <Stack gap="lg">
      <Spoiler
        maxHeight={150}
        showLabel="Tampilkan lebih banyak"
        hideLabel="Tampilkan lebih sedikit"
      >
        <Stack gap="lg">
          <MainCard transparent noPadding row>
            <FilterDate
              filter={filter}
              handleChangeFilter={handleChangeFilter}
            />
          </MainCard>
          <MainCard
            transparent
            noPadding
            row
            center
            style={{ justifyContent: "space-around" }}
          >
            <FilterInformation
              filter={filter}
              handleChangeFilter={handleChangeFilter}
            />
            <FilterType
              filter={filter}
              handleChangeFilter={handleChangeFilter}
            />
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
            <FilterBank
              filter={filter}
              handleChangeFilter={handleChangeFilter}
            />
          </MainCard>
        </Stack>
      </Spoiler>
      <PrettyJSON text={filteredData} />
      <BarChart
        h={400}
        data={[]}
        dataKey={
          filter.mode === "hari"
            ? "hour"
            : filter.mode === "bulan"
            ? "day"
            : "month"
        }
        series={[]}
        tickLine="y"
      />
    </Stack>
  );
}
