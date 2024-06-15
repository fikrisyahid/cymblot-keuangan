import {
  IconBuildingBank,
  IconChartHistogram,
  IconDashboard,
  IconTable,
  IconTargetArrow,
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
  {
    title: "Sumber & Tujuan",
    icon: <IconTargetArrow />,
    route: "/sumber-tujuan",
  },
  {
    title: "Bank",
    icon: <IconBuildingBank />,
    route: "/bank",
  },
];

export default sidebarMenu;
