'use client';

import { Transaction } from '@prisma/client';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

export default function DetailTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  dayjs.locale('id');

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'no',
    direction: 'asc',
  });

  const sortedRecords = useMemo(() => {
    const data = sortBy(transactions, sortStatus.columnAccessor);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [sortStatus, transactions]);

  return (
    <DataTable
      minHeight={150}
      withTableBorder
      borderRadius="md"
      columns={[
        {
          accessor: 'no',
          title: 'No.',
          sortable: true,
          width: 70,
        },
        {
          accessor: 'date',
          title: 'Tanggal',
          sortable: true,
          render: (record) =>
            dayjs(record.date).format('dddd, DD MMMM YYYY @HH:mm'),
        },
        { accessor: 'information', title: 'Keterangan', sortable: true },
        { accessor: 'type', title: 'Jenis', sortable: true },
        { accessor: 'value', title: 'Nominal', sortable: true },
        {
          accessor: 'category',
          title: 'Kategori',
          sortable: true,
          render: (record) => record.Category?.name,
        },
        {
          accessor: 'pocket',
          title: 'Kantong',
          sortable: true,
          render: (record) => record.Pocket?.name,
        },
        {
          accessor: 'actions',
          title: 'Aksi',
          textAlign: 'right',
          width: 100,
          render: () => (
            <div className="flex flex-row justify-end gap-2">
              <button type="button">Dummy</button>
            </div>
          ),
        },
      ]}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      records={sortedRecords}
      noRecordsText="Belum ada kantong yang ditambahkan."
    />
  );
}
