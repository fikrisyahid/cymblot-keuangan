'use client';

import convertTransactionType from '@/utils/convert-transaction-type';
import { Badge, NumberFormatter, Stack } from '@mantine/core';
import { IconArrowNarrowDown } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { DataTable } from 'mantine-datatable';

export default function RecentTransactionTable({
  transactions,
}: {
  transactions: any[];
}) {
  dayjs.locale('id');

  return (
    <DataTable
      minHeight={150}
      withTableBorder
      borderRadius="md"
      columns={[
        {
          accessor: 'no',
          title: 'No.',
          width: 70,
        },
        {
          accessor: 'date',
          title: 'Tanggal',
          render: (record: any) =>
            dayjs(record.date).format('dddd, DD MMMM YYYY @HH:mm'),
        },
        {
          accessor: 'information',
          title: 'Keterangan',
        },
        {
          accessor: 'type',
          title: 'Jenis',
          textAlign: 'center',
          render: (record: any) => {
            const typeFromDB = record?.type;
            const typeInID = convertTransactionType(typeFromDB);
            const color =
              typeInID === 'PEMASUKAN'
                ? 'teal'
                : typeInID === 'PENGELUARAN'
                ? 'red'
                : 'violet';
            return (
              <div className="flex justify-center">
                <Badge color={color} fullWidth>
                  {typeInID}
                </Badge>
              </div>
            );
          },
        },
        {
          accessor: 'value',
          title: 'Nominal',
          textAlign: 'right',
          render: (record: any) => (
            <div className="flex justify-end">
              <NumberFormatter
                prefix="Rp"
                value={record?.value}
                thousandSeparator
              />
            </div>
          ),
        },
        {
          accessor: 'category',
          title: 'Kategori',
          render: (record: any) => record.Category?.name,
        },
        {
          accessor: 'pocket',
          title: 'Kantong',
          textAlign: 'center',
          render: (record: any) => {
            if (record.type === 'TRANSFER') {
              return (
                <Stack gap={0} align="center">
                  <Badge fullWidth>{record.PocketSource?.name}</Badge>
                  <IconArrowNarrowDown color="teal" />
                  <Badge fullWidth>{record.PocketDestination?.name}</Badge>
                </Stack>
              );
            }
            return (
              <div className="flex justify-center">
                <Badge fullWidth>{record.Pocket?.name}</Badge>
              </div>
            );
          },
        },
      ]}
      records={transactions}
      noRecordsText="Belum ada transaksi yang ditambahkan."
    />
  );
}
