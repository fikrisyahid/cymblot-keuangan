'use client';

import { Transaction } from '@prisma/client';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ActionIcon, Badge, NumberFormatter, Stack } from '@mantine/core';
import {
  IconArrowNarrowDown,
  IconPencil,
} from '@tabler/icons-react';
import convertTransactionType from '@/utils/convert-transaction-type';
import { TEXT_COLOR } from '@/config/color';
import Link from 'next/link';
import DeleteTransactionForm from './delete-form';

const PAGE_SIZES = [5, 15, 25, 50, 75, 100];

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedRecords.slice(from, to);
  }, [page, pageSize, sortedRecords]);

  return (
    <DataTable
      style={{ color: TEXT_COLOR }}
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
        {
          accessor: 'type',
          title: 'Jenis',
          sortable: true,
          textAlign: 'center',
          render: (record) => {
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
          sortable: true,
          textAlign: 'right',
          render: (record) => (
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
          sortable: true,
          render: (record) => record.Category?.name,
        },
        {
          accessor: 'pocket',
          title: 'Kantong',
          sortable: true,
          textAlign: 'center',
          render: (record) => {
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
        {
          accessor: 'actions',
          title: 'Aksi',
          textAlign: 'right',
          width: 100,
          render: (record) => (
            <div className="flex flex-row justify-end gap-2">
              <ActionIcon
                variant="filled"
                component={Link}
                href={`/detail/${record.id}`}
                color="yellow"
              >
                <IconPencil
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                />
              </ActionIcon>
              <DeleteTransactionForm selectedTransaction={record} />
            </div>
          ),
        },
      ]}
      page={page}
      onPageChange={(p) => setPage(p)}
      sortStatus={sortStatus}
      recordsPerPage={pageSize}
      recordsPerPageOptions={PAGE_SIZES}
      totalRecords={transactions.length}
      paginationActiveBackgroundColor="grape"
      onRecordsPerPageChange={setPageSize}
      onSortStatusChange={setSortStatus}
      records={paginatedRecords}
      noRecordsText="Belum ada kantong yang ditambahkan."
    />
  );
}
