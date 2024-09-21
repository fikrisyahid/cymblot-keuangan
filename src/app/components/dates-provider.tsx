'use client';

import 'dayjs/locale/id';

import { DatesProvider } from '@mantine/dates';
import { ReactNode } from 'react';

export default function ClientDatesProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <DatesProvider settings={{ locale: 'id' }}>{children}</DatesProvider>;
}
