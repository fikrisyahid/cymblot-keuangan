'use client';

import { BUTTON_BASE_COLOR } from '@/config/color';
import { Button, Flex } from '@mantine/core';
import { DataTable } from 'mantine-datatable';

export default function CategoryTable() {
  return (
    <DataTable
      withTableBorder
      borderRadius="md"
      columns={[
        {
          accessor: 'number',
          title: 'No.',
          render: (_, index) => index + 1,
          width: 45,
        },
        { accessor: 'category' },
        {
          accessor: 'actions',
          title: 'Aksi',
          textAlign: 'right',
          render: () => (
            <Flex gap="sm" justify="flex-end">
              <Button color={BUTTON_BASE_COLOR}>Tes</Button>
            </Flex>
          ),
        },
      ]}
      records={[
        { id: 1, category: 'Joe Biden' },
        { id: 2, category: 'Joe Mama' },
      ]}
      noRecordsText="Belum ada bank yang ditambahkan."
    />
  );
}
