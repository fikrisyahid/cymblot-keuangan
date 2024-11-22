'use client';

import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useMemo, useState } from 'react';
import { BUTTON_BASE_COLOR, TEXT_COLOR } from '@/config/color';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/id';
import { Button, NumberFormatter, Stack, Text, TextInput } from '@mantine/core';
import { Category, Pocket, Transaction } from '@prisma/client';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { generateColumn } from './helper';
import { ITableFilter } from './interface';
import getTotalDeposit from '../actions/functions/get-total-deposit';
import getTotalWithdraw from '../actions/functions/get-total-withdraw';
import getTotalTransfer from '../actions/functions/get-total-transfer';

const PAGE_SIZES = [5, 10, 25, 50, 75, 100];

dayjs.locale('id');
dayjs.extend(utc);
dayjs.extend(timezone);

export default function DetailTable({
  transactions,
  categories,
  pockets,
}: {
  transactions: (Transaction & {
    Category: Category;
    Pocket: Pocket;
    PocketSource: Pocket;
    PocketDestination: Pocket;
  })[];
  categories: Category[];
  pockets: Pocket[];
}) {
  const oldestTransactionDate = transactions.reduce(
    (acc, curr) => (acc < curr.date ? acc : curr.date),
    new Date(),
  );

  const filterDefaultState = {
    generalSearch: '',
    date: {
      start: dayjs(oldestTransactionDate).startOf('day').toDate(),
      end: dayjs().tz('Asia/Jakarta').endOf('day').toDate(),
    },
    information: '',
    type: [],
    value: {
      min: '',
      max: '',
      equal: '',
    },
    category: [],
    pocket: [],
  };

  const [filter, setFilter] = useState<ITableFilter>(filterDefaultState);

  const handleChange = (newKeyValue: any) => {
    setFilter((prev) => ({ ...prev, ...newKeyValue }));
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  const filterStatus = useMemo(
    () => ({
      generalSearchActive: filter.generalSearch !== '',
      dateStartActive:
        filter.date.start.getTime() !==
        dayjs(oldestTransactionDate).startOf('day').toDate().getTime(),
      dateEndActive:
        filter.date.end.getTime() !==
        dayjs().tz('Asia/Jakarta').endOf('day').toDate().getTime(),
      informationActive: filter.information !== '',
      typeActive: filter.type.length > 0,
      valueMinActive: filter.value.min !== '',
      valueMaxActive: filter.value.max !== '',
      valueEqualActive: filter.value.equal !== '',
      categoryActive: filter.category.length > 0,
      pocketActive: filter.pocket.length > 0,
    }),
    [filter, oldestTransactionDate],
  );

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'no',
    direction: 'asc',
  });

  const filteredRecords = useMemo(
    () =>
      transactions.filter((record) => {
        const {
          generalSearch,
          date,
          information,
          type,
          value,
          category,
          pocket,
        } = filter;

        const {
          generalSearchActive,
          dateStartActive,
          dateEndActive,
          informationActive,
          typeActive,
          valueMinActive,
          valueMaxActive,
          valueEqualActive,
          categoryActive,
          pocketActive,
        } = filterStatus;

        if (
          generalSearchActive &&
          !dayjs(record.date)
            .format('dddd, DD MMMM YYYY @HH:mm')
            .toLowerCase()
            .includes(generalSearch.toLowerCase()) &&
          !record.information
            .toLowerCase()
            .includes(generalSearch.toLowerCase()) &&
          !record.type.toLowerCase().includes(generalSearch.toLowerCase()) &&
          !record.value.toString().includes(generalSearch) &&
          !record.Category?.name
            .toLowerCase()
            .includes(generalSearch.toLowerCase()) &&
          !record.Pocket?.name
            .toLowerCase()
            .includes(generalSearch.toLowerCase())
        ) {
          return false;
        }
        if (dateStartActive && record.date < date.start) {
          return false;
        }
        if (dateEndActive && record.date > date.end) {
          return false;
        }
        if (
          informationActive &&
          !record.information
            ?.toLowerCase()
            ?.includes(information.toLowerCase())
        ) {
          return false;
        }
        if (typeActive && !type.includes(record.type)) {
          return false;
        }
        if (valueMinActive && record.value < Number(value.min)) {
          return false;
        }
        if (valueMaxActive && record.value > Number(value.max)) {
          return false;
        }
        if (valueEqualActive && record.value !== Number(value.equal)) {
          return false;
        }
        if (categoryActive && !category.includes(record.Category?.id)) {
          return false;
        }
        if (
          pocketActive &&
          !pocket.includes(record.Pocket?.id) &&
          !pocket.includes(record.PocketSource?.id) &&
          !pocket.includes(record.PocketDestination?.id)
        ) {
          return false;
        }
        return true;
      }),
    [transactions, filter, filterStatus],
  );

  const totalBalanceFiltered = useMemo(
    () =>
      filteredRecords.reduce((acc, curr) => {
        if (curr.type === 'DEPOSIT') {
          return acc + curr.value;
        }
        if (curr.type === 'WITHDRAW') {
          return acc - curr.value;
        }
        return acc;
      }, 0),
    [filteredRecords],
  );

  const userTotalDeposit = getTotalDeposit({
    transactions: filteredRecords,
  });
  const userTotalWithdraw = getTotalWithdraw({
    transactions: filteredRecords,
  });
  const userTotalTransaction = getTotalTransfer({
    transactions: filteredRecords,
  });

  const sortedRecords = useMemo(() => {
    const data = sortBy(filteredRecords, sortStatus.columnAccessor);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [sortStatus, filteredRecords]);

  useEffect(() => {
    setPage(1);
  }, [sortStatus, pageSize, filter]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedRecords.slice(from, to);
  }, [page, pageSize, sortedRecords]);

  return (
    <Stack gap="sm">
      <div className="flex flex-col w-full sm:justify-between sm:flex-row gap-2 mt-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-primary p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Saldo:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={totalBalanceFiltered}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-[#4b9a41] p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Pemasukan:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={userTotalDeposit}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-red-500 p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Pengeluaran:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={userTotalWithdraw}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 sm:gap-1 w-full sm:w-auto bg-violet-600 p-2 rounded-md shadow-md">
            <Text c="white" size="sm">
              Transfer:{' '}
            </Text>
            <NumberFormatter
              prefix="Rp "
              value={userTotalTransaction}
              thousandSeparator
              className="text-white text-sm font-bold"
            />
          </div>
        </div>
        <Button
          color={BUTTON_BASE_COLOR}
          leftSection={<IconPlus />}
          component={Link}
          href="/detail/add"
        >
          Tambah Data Keuangan
        </Button>
      </div>
      <TextInput
        placeholder="Cari data keseluruhan"
        value={filter.generalSearch}
        onChange={(e) => handleChange({ generalSearch: e.currentTarget.value })}
      />
      <DataTable
        style={{ color: TEXT_COLOR }}
        minHeight={200}
        withTableBorder
        borderRadius="md"
        columns={generateColumn({
          filter,
          handleChange,
          categories,
          pockets,
        })}
        page={page}
        onPageChange={(p) => setPage(p)}
        sortStatus={sortStatus}
        recordsPerPage={pageSize}
        recordsPerPageOptions={PAGE_SIZES}
        totalRecords={sortedRecords.length}
        paginationActiveBackgroundColor="grape"
        onRecordsPerPageChange={setPageSize}
        onSortStatusChange={setSortStatus}
        records={paginatedRecords}
        noRecordsText="Belum ada transaksi yang ditambahkan."
      />
    </Stack>
  );
}
