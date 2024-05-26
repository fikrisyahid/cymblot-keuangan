import {
  IconChartHistogram,
  IconDashboard,
  IconTable,
} from "@tabler/icons-react";

const sidebarMenu = [
  {
    title: "Dashboard",
    icon: <IconDashboard />,
    route: "/dashboard",
  },
  {
    title: "Grafik",
    icon: <IconChartHistogram />,
    route: "/grafik",
  },
  {
    title: "Detail",
    icon: <IconTable />,
    route: "/detail",
  },
];

export default sidebarMenu;
