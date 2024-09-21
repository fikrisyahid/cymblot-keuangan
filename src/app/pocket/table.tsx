'use client';

import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useMemo, useState } from 'react';
import EditPocketForm from './edit-form';
import DeletePocketForm from './delete-form';

export default function PocketTable({ pockets }: { pockets: any[] }) {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'no',
    direction: 'asc',
  });

  const sortedRecords = useMemo(() => {
    const data = sortBy(pockets, sortStatus.columnAccessor);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [sortStatus, pockets]);

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
          render: (record) => (
            <div className="flex flex-row justify-end gap-2">
              <EditPocketForm pockets={pockets} selectedPocket={record} />
              <DeletePocketForm selectedPocket={record} />
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
