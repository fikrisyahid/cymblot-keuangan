import dayjs from "dayjs";
import { ITransaksi } from "@/types/db";
import { IFilterGraph } from "../types";

interface ChartData {
  [key: string]: any;
}

const generateChartData = ({
  filter,
  filteredData,
}: {
  filter: IFilterGraph;
  filteredData: ITransaksi[];
}) => {
  let dataKey = "day"; // default
  let data: ChartData[] = [];
  let series: { name: string; color: string }[] = [];

  const colors = {
    Pemasukan: "violet.6",
    Pengeluaran: "blue.6",
  };

  const generateColor = (index: number, length: number) =>
    `hsl(${(index * 360) / length}, 70%, 50%)`;

  if (filter.mode === "range") {
    dataKey = "day";
    const start = dayjs(filter.tanggal_sesudah);
    const end = dayjs(filter.tanggal_sebelum);
    const days = end.diff(start, "day") + 1;
    data = Array.from({ length: days }, (_, i) => ({
      day: start.add(i, "day").format("YYYY-MM-DD"),
    }));

    filteredData.forEach((item) => {
      const date = dayjs(item.tanggal).format("YYYY-MM-DD");
      const dayData = data.find((d) => d.day === date);
      if (dayData) {
        if (filter.jenis === "SEMUA") {
          const key = item.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran";
          dayData[key] = (dayData[key] || 0) + item.nominal;
        } else if (filter.jenis === "PEMASUKAN") {
          const key = item.sumber?.nama;
          if (key) {
            dayData[key] = (dayData[key] || 0) + item.nominal;
          }
        } else if (filter.jenis === "PENGELUARAN") {
          const key = item.tujuan?.nama;
          if (key) {
            dayData[key] = (dayData[key] || 0) + item.nominal;
          }
        }
      }
    });
  } else if (filter.mode === "hari") {
    dataKey = "hour";
    data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
    }));

    filteredData.forEach((item) => {
      const hour = dayjs(item.tanggal).hour();
      const hourData = data.find((d) => d.hour === hour);
      if (hourData) {
        if (filter.jenis === "SEMUA") {
          const key = item.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran";
          hourData[key] = (hourData[key] || 0) + item.nominal;
        } else if (filter.jenis === "PEMASUKAN") {
          const key = item.sumber?.nama;
          if (key) {
            hourData[key] = (hourData[key] || 0) + item.nominal;
          }
        } else if (filter.jenis === "PENGELUARAN") {
          const key = item.tujuan?.nama;
          if (key) {
            hourData[key] = (hourData[key] || 0) + item.nominal;
          }
        }
      }
    });
  } else if (filter.mode === "bulan") {
    dataKey = "day";
    const daysInMonth = dayjs(filter.tanggal_sesudah).daysInMonth();
    data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
    }));

    filteredData.forEach((item) => {
      const day = dayjs(item.tanggal).date();
      const dayData = data.find((d) => d.day === day);
      if (dayData) {
        if (filter.jenis === "SEMUA") {
          const key = item.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran";
          dayData[key] = (dayData[key] || 0) + item.nominal;
        } else if (filter.jenis === "PEMASUKAN") {
          const key = item.sumber?.nama;
          if (key) {
            dayData[key] = (dayData[key] || 0) + item.nominal;
          }
        } else if (filter.jenis === "PENGELUARAN") {
          const key = item.tujuan?.nama;
          if (key) {
            dayData[key] = (dayData[key] || 0) + item.nominal;
          }
        }
      }
    });
  } else if (filter.mode === "tahun") {
    dataKey = "month";
    data = Array.from({ length: 12 }, (_, i) => ({
      month: dayjs().month(i).format("MMMM"),
    }));

    filteredData.forEach((item) => {
      const month = dayjs(item.tanggal).format("MMMM");
      const monthData = data.find((d) => d.month === month);
      if (monthData) {
        if (filter.jenis === "SEMUA") {
          const key = item.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran";
          monthData[key] = (monthData[key] || 0) + item.nominal;
        } else if (filter.jenis === "PEMASUKAN") {
          const key = item.sumber?.nama;
          if (key) {
            monthData[key] = (monthData[key] || 0) + item.nominal;
          }
        } else if (filter.jenis === "PENGELUARAN") {
          const key = item.tujuan?.nama;
          if (key) {
            monthData[key] = (monthData[key] || 0) + item.nominal;
          }
        }
      }
    });
  }

  if (filter.jenis === "SEMUA") {
    series = [
      { name: "Pemasukan", color: colors.Pemasukan },
      { name: "Pengeluaran", color: colors.Pengeluaran },
    ];
  } else if (filter.jenis === "PEMASUKAN") {
    const sources = Array.from(
      new Set(filteredData.map((item) => item.sumber?.nama))
    );
    series = sources
      .filter((source): source is string => source !== undefined)
      .map((source, index) => ({
        name: source,
        color: generateColor(index, sources.length),
      }));
  } else if (filter.jenis === "PENGELUARAN") {
    const purposes = Array.from(
      new Set(filteredData.map((item) => item.tujuan?.nama))
    );
    series = purposes
      .filter((purpose): purpose is string => purpose !== undefined)
      .map((purpose, index) => ({
        name: purpose,
        color: generateColor(index, purposes.length),
      }));
  }

  return { data, dataKey, series };
};

export default generateChartData;
