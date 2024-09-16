'use client';

import { TEXT_COLOR } from '@/config/color';
import { DataTable } from 'mantine-datatable';

export default function DetailTable() {
  return (
    <DataTable
      withTableBorder
      borderRadius="sm"
      withColumnBorders
      striped
      highlightOnHover
      style={{ color: TEXT_COLOR }}
      records={[
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 2, name: 'Joe Mama', bornIn: 1942, party: 'Democratic' },
      ]}
      columns={[
        {
          accessor: 'id',
          title: '#',
          textAlign: 'right',
        },
        { accessor: 'name' },
        { accessor: 'bornIn' },
      ]}
    />
  );
}
