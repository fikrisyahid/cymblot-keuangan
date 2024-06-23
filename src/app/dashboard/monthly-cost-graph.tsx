"use client";

import { useState, useEffect } from "react";
import { TEXT_COLOR } from "@/config";
import { ITransaksi } from "@/types/db";
import { BarChart } from "@mantine/charts";
import { Flex, Select, Text, Badge, Stack } from "@mantine/core";
import dayjs from "dayjs";
import stringToRupiah from "@/utils/string-to-rupiah";

export default function MonthlyCostGraph({
  transaksiUser,
}: {
  transaksiUser: ITransaksi[];
}) {
  const [filter, setFilter] = useState("1 Bulan");
  const [filteredData, setFilteredData] = useState<ITransaksi[]>([]);
  const [title, setTitle] = useState("Pengeluaran Terbesar Bulan Ini");

  useEffect(() => {
    const filterData = () => {
      const now = dayjs();
      if (filter === "Minggu Ini") {
        setTitle("Pengeluaran Terbesar Minggu Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "week"))
          )
        );
      }
      if (filter === "1 Bulan") {
        setTitle("Pengeluaran Terbesar Bulan Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "month"))
          )
        );
      }
      if (filter === "3 Bulan") {
        setTitle("Pengeluaran Terbesar 3 Bulan Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(3, "month"))
          )
        );
      }
      if (filter === "1 Tahun") {
        setTitle("Pengeluaran Terbesar 1 Tahun Ini");
        setFilteredData(
          transaksiUser.filter((transaksi) =>
            dayjs(transaksi.tanggal).isAfter(now.subtract(1, "year"))
          )
        );
      }
      if (filter === "Semua") {
        setTitle("Pengeluaran Terbesar Seluruhnya");
        setFilteredData(transaksiUser);
      }
    };
    filterData();
  }, [filter, transaksiUser]);

  const aggregateData = () => {
    const dataMap: { [key: string]: number } = {};

    filteredData.forEach((transaksi) => {
      const tujuan = transaksi.tujuan?.nama || "Lainnya";
      if (transaksi.jenis === "PENGELUARAN") {
        dataMap[tujuan] = (dataMap[tujuan] || 0) + transaksi.nominal;
      }
    });

    const data = Object.entries(dataMap)
      .map(([tujuan, Pengeluaran]) => ({ tujuan, Pengeluaran }))
      .sort((a, b) => b.Pengeluaran - a.Pengeluaran);

    return data;
  };

  const chartData = aggregateData();
  const totalPengeluaran = filteredData
    .filter((transaksi) => transaksi.jenis === "PENGELUARAN")
    .reduce((acc, transaksi) => acc + transaksi.nominal, 0);

  return (
    <>
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Text fw={700} size="xl" c={TEXT_COLOR}>
            {title}
          </Text>
          <Text>Total Pengeluaran:</Text>
          <Badge color="red" variant="filled">
            {stringToRupiah(totalPengeluaran.toString())}
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
          dataKey="tujuan"
          series={[{ name: "Pengeluaran", color: "red" }]}
          tickLine="y"
          tooltipAnimationDuration={200}
        />
      ) : (
        <Text>Tidak ada data keuangan di periode ini</Text>
      )}
    </>
  );
}
