"use client";

import { useState, useEffect } from "react";
import { TEXT_COLOR } from "@/config";
import { ITransaksi } from "@/types/db";
import { BarChart } from "@mantine/charts";
import { Flex, Select, Text, Badge, Stack } from "@mantine/core";
import dayjs from "dayjs";
import stringToRupiah from "@/utils/string-to-rupiah";

export default function MonthlyIncomeGraph({
  transaksiUser,
}: {
  transaksiUser: ITransaksi[];
}) {
  const [filter, setFilter] = useState("1 Bulan");
  const [filteredData, setFilteredData] = useState<ITransaksi[]>([]);
  const [title, setTitle] = useState("Pemasukan Terbesar Bulan Ini");

  useEffect(() => {
    const filterData = () => {
      const now = dayjs();
      if (filter === "Minggu Ini") {
        setTitle("Pemasukan Terbesar Minggu Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "week"))
          )
        );
      }
      if (filter === "1 Bulan") {
        setTitle("Pemasukan Terbesar Bulan Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "month"))
          )
        );
      }
      if (filter === "3 Bulan") {
        setTitle("Pemasukan Terbesar 3 Bulan Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(3, "month"))
          )
        );
      }
      if (filter === "1 Tahun") {
        setTitle("Pemasukan Terbesar 1 Tahun Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "year"))
          )
        );
      }
      if (filter === "Semua") {
        setTitle("Pemasukan Terbesar Seluruhnya");
        setFilteredData(transaksiUser);
      }
    };
    filterData();
  }, [filter, transaksiUser]);

  const aggregateData = () => {
    const dataMap: { [key: string]: number } = {};

    filteredData.forEach((transaksi) => {
      const sumber = transaksi.sumber?.nama || "Lainnya";
      if (transaksi.jenis === "PEMASUKAN") {
        dataMap[sumber] = (dataMap[sumber] || 0) + transaksi.nominal;
      }
    });

    const data = Object.entries(dataMap)
      .map(([sumber, Pemasukan]) => ({ sumber, Pemasukan }))
      .sort((a, b) => b.Pemasukan - a.Pemasukan);

    return data;
  };

  const chartData = aggregateData();
  const totalPemasukan = filteredData
    .filter((transaksi) => transaksi.jenis === "PEMASUKAN")
    .reduce((acc, transaksi) => acc + transaksi.nominal, 0);

  return (
    <>
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Text fw={700} size="xl" c={TEXT_COLOR}>
            {title}
          </Text>
          <Text>Total Pemasukan:</Text>
          <Badge color="lime" variant="filled">
            {stringToRupiah(totalPemasukan.toString())}
          </Badge>
        </Stack>
        <Select
          value={filter}
          onChange={(value) => setFilter(value!)}
          data={["Minggu Ini", "1 Bulan", "3 Bulan", "1 Tahun", "Semua"]}
        />
      </Flex>
      {chartData.length > 0 ? (
        <BarChart
          h={300}
          data={chartData}
          dataKey="sumber"
          series={[{ name: "Pemasukan", color: "violet.6" }]}
          tickLine="y"
        />
      ) : (
        <Text>Tidak ada data keuangan di periode ini</Text>
      )}
    </>
  );
}
