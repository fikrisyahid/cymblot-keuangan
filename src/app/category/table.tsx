'use client';

import { BUTTON_BASE_COLOR } from '@/config/color';
import { Button, Flex } from '@mantine/core';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useMemo, useState } from 'react';

export default function CategoryTable({ categories }: { categories: any[] }) {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'no',
    direction: 'asc',
  });

  const sortedRecords = useMemo(() => {
    const data = sortBy(categories, sortStatus.columnAccessor);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [sortStatus, categories]);

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
        { accessor: 'name', title: 'Nama', sortable: true },
        {
          accessor: 'actions',
          title: 'Aksi',
          textAlign: 'right',
          width: 100,
          render: () => (
            <Flex gap="sm" justify="flex-end">
              <Button color={BUTTON_BASE_COLOR}>Tes</Button>
            </Flex>
          ),
        },
      ]}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      records={sortedRecords}
      noRecordsText="Belum ada kategori yang ditambahkan."
    />
  );
}
