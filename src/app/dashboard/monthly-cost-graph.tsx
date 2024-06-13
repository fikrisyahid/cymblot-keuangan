import { BarChart } from "@mantine/charts";

export default function MonthlyCostGraph() {
  return (
    <BarChart
      h={300}
      data={[
        { name: "Jan", value: 1000 },
        { name: "Feb", value: 2000 },
        { name: "Mar", value: 1500 },
        { name: "Apr", value: 3000 },
        { name: "May", value: 2500 },
        { name: "Jun", value: 3500 },
        { name: "Jul", value: 4000 },
        { name: "Aug", value: 3000 },
        { name: "Sep", value: 3500 },
        { name: "Oct", value: 2000 },
        { name: "Nov", value: 2500 },
        { name: "Dec", value: 3000 },
      ]}
      dataKey="name"
      series={[{ name: "value", color: "violet.6" }]}
      tickLine="y"
    />
  );
}
