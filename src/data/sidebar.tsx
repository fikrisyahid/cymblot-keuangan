import {
  IconCategory,
  IconChartHistogram,
  IconDashboard,
  IconTable,
  IconWallet,
} from '@tabler/icons-react';

const sidebarMenu = [
  {
    title: 'Dashboard',
    icon: <IconDashboard />,
    route: '/dashboard',
  },
  {
    title: 'Grafik',
    icon: <IconChartHistogram />,
    route: '/graph',
  },
  {
    title: 'Detail',
    icon: <IconTable />,
    route: '/detail',
  },
  {
    title: 'Kategori',
    icon: <IconCategory />,
    route: '/category',
  },
  {
    title: 'Kantong',
    icon: <IconWallet />,
    route: '/pocket',
  },
];

export default sidebarMenu;
