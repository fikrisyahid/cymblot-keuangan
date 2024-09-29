import {
  IconCategory,
  IconChartHistogram,
  IconDashboard,
  IconInfoCircle,
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
  {
    title: 'Tentang',
    icon: <IconInfoCircle />,
    route: '/about',
  },
];

export default sidebarMenu;
