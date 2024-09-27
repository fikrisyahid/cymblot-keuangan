'use client';

import { BarChart } from '@mantine/charts';
import {
  Button,
  Checkbox,
  NumberInput,
  SegmentedControl,
  Select,
  Spoiler,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useMemo, useState } from 'react';
import { Category, Pocket } from '@prisma/client';
import { BUTTON_BASE_COLOR } from '@/config/color';
import { generateChartData } from './helper';
import { IChartFilter } from './interaface';

dayjs.locale('id');
dayjs.extend(utc);
dayjs.extend(timezone);

export default function DetailChart({
  transactions,
  pockets,
  categories,
}: {
  transactions: any[];
  pockets: Pocket[];
  categories: Category[];
}) {
  const oldestTransactionDate = useMemo(() => {
    if (transactions.length === 0) {
      return dayjs();
    }
    const sortedTransactions = transactions.sort(
      (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    );
    return dayjs(sortedTransactions[0].date);
  }, [transactions]);

  const [filter, setFilter] = useState<IChartFilter>({
    mode: 'month',
    day: dayjs().date(),
    month: dayjs().month(),
    year: dayjs().year(),
    minDate: dayjs(oldestTransactionDate).startOf('day').toDate(),
    maxDate: dayjs().tz('Asia/Jakarta').endOf('day').toDate(),
    information: '',
    type: [],
    value: {
      min: '',
      max: '',
      equal: '',
    },
    category: [],
    pocket: [],
  });

  const handleChange = (newKeyValue: any) => {
    setFilter((prev) => ({ ...prev, ...newKeyValue }));
  };

  const filterStatus = useMemo(
    () => ({
      dateStartActive:
        filter.minDate.getTime() !==
        dayjs(oldestTransactionDate).startOf('day').toDate().getTime(),
      dateEndActive:
        filter.maxDate.getTime() !==
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

  const filteredTransactions = useMemo(() => {
    // Filter by date
    const filteredDate = transactions.filter((transaction) => {
      const transactionDate = dayjs(transaction.date);
      if (filter.mode === 'range') {
        return (
          transactionDate.isAfter(dayjs(filter.minDate)) &&
          transactionDate.isBefore(dayjs(filter.maxDate))
        );
      }
      if (filter.mode === 'day') {
        return (
          transactionDate.date() === filter.day &&
          transactionDate.month() === filter.month &&
          transactionDate.year() === filter.year
        );
      }
      if (filter.mode === 'month') {
        return (
          transactionDate.month() === filter.month &&
          transactionDate.year() === filter.year
        );
      }
      if (filter.mode === 'year') {
        return transactionDate.year() === filter.year;
      }
      return true;
    });

    // Filter by options
    const filteredOptions = filteredDate.filter((transaction) => {
      const { information, type, value, category, pocket } = filter;
      const {
        informationActive,
        typeActive,
        valueMinActive,
        valueMaxActive,
        valueEqualActive,
        categoryActive,
        pocketActive,
      } = filterStatus;

      if (
        informationActive &&
        !transaction.information
          .toLowerCase()
          .includes(information.toLowerCase())
      ) {
        return false;
      }
      if (typeActive && !type.includes(transaction.type)) {
        return false;
      }
      if (valueMinActive && transaction.value < parseInt(value.min, 10)) {
        return false;
      }
      if (valueMaxActive && transaction.value > parseInt(value.max, 10)) {
        return false;
      }
      if (valueEqualActive && transaction.value !== parseInt(value.equal, 10)) {
        return false;
      }
      if (categoryActive && !category.includes(transaction.categoryId)) {
        return false;
      }
      if (pocketActive && !pocket.includes(transaction.pocketId)) {
        return false;
      }

      return true;
    });

    return filteredOptions;
  }, [transactions, filter, filterStatus]);

  const chartData = useMemo(
    () =>
      generateChartData({
        filteredTransactions,
        filter,
      }),
    [filteredTransactions, filter],
  );

  return (
    <Spoiler
      maxHeight={300}
      showLabel="Lihat lebih lanjut"
      hideLabel="Sembunyikan"
    >
      <Stack>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SegmentedControl
            value={filter.mode}
            onChange={(value) =>
              setFilter((prev) => ({
                ...prev,
                mode: value as IChartFilter['mode'],
              }))
            }
            data={[
              { label: 'Jarak', value: 'range' },
              { label: 'Hari', value: 'day' },
              { label: 'Bulan', value: 'month' },
              { label: 'Tahun', value: 'year' },
            ]}
          />
          {filter.mode === 'day' && (
            <Select
              value={filter.day.toString()}
              data={Array.from(
                { length: dayjs().month(filter.month).daysInMonth() },
                (_, i) => ({
                  value: (i + 1).toString(),
                  label: (i + 1).toString(),
                }),
              )}
              onChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  day: parseInt(value as string, 10),
                }))
              }
            />
          )}
          {(filter.mode === 'day' || filter.mode === 'month') && (
            <Select
              value={filter.month.toString()}
              data={Array.from({ length: 12 }, (_, i) => ({
                value: i.toString(),
                label: dayjs().month(i).format('MMMM'),
              }))}
              onChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  month: parseInt(value as string, 10),
                }))
              }
            />
          )}
          {(filter.mode === 'day' ||
            filter.mode === 'month' ||
            filter.mode === 'year') && (
            <Select
              value={filter.year.toString()}
              data={Array.from(
                { length: dayjs().year() - oldestTransactionDate.year() + 1 },
                (_, i) => ({
                  value: (oldestTransactionDate.year() + i).toString(),
                  label: (oldestTransactionDate.year() + i).toString(),
                }),
              )}
              onChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  year: parseInt(value as string, 10),
                }))
              }
            />
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Stack gap={0}>
            <Text fw={500}>Filter keterangan</Text>
            <TextInput
              placeholder="Masukkan keterangan yang ingin dicari"
              value={filter.information}
              onChange={(e) =>
                handleChange({ information: e.currentTarget.value })
              }
              style={{
                width: '350px',
              }}
            />
          </Stack>
          <Stack>
            <Text fw={500} mb={-10}>
              Filter jenis
            </Text>
            <Checkbox
              checked={filter.type.includes('DEPOSIT')}
              label="PEMASUKAN"
              onChange={(e) =>
                handleChange({
                  type: e.currentTarget.checked
                    ? [...filter.type, 'DEPOSIT']
                    : filter.type.filter((f) => f !== 'DEPOSIT'),
                })
              }
            />
            <Checkbox
              checked={filter.type.includes('WITHDRAW')}
              label="PENGELUARAN"
              onChange={(e) =>
                handleChange({
                  type: e.currentTarget.checked
                    ? [...filter.type, 'WITHDRAW']
                    : filter.type.filter((f) => f !== 'WITHDRAW'),
                })
              }
            />
            <Checkbox
              checked={filter.type.includes('TRANSFER')}
              label="TRANSFER"
              onChange={(e) =>
                handleChange({
                  type: e.currentTarget.checked
                    ? [...filter.type, 'TRANSFER']
                    : filter.type.filter((f) => f !== 'TRANSFER'),
                })
              }
            />
            {filter.type.length > 0 && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() => handleChange({ type: [] })}
              >
                Reset
              </Button>
            )}
          </Stack>
          <Stack>
            <Text fw={500} mb={-10}>
              Filter nominal
            </Text>
            <NumberInput
              label="Batas bawah"
              description="Filter transaksi dengan nominal lebih besar dari atau sama dengan"
              thousandSeparator=","
              placeholder="Masukkan batas bawah"
              value={filter.value.min}
              prefix="Rp"
              allowNegative={false}
              onChange={(e) =>
                handleChange({ value: { ...filter.value, min: e } })
              }
            />
            <NumberInput
              label="Batas atas"
              description="Filter transaksi dengan nominal lebih kecil dari atau sama dengan"
              thousandSeparator=","
              placeholder="Masukkan batas atas"
              value={filter.value.max}
              prefix="Rp"
              allowNegative={false}
              onChange={(e) =>
                handleChange({ value: { ...filter.value, max: e } })
              }
            />
            <NumberInput
              label="Sama dengan"
              description="Filter transaksi dengan nominal sama dengan"
              thousandSeparator=","
              placeholder="Masukkan nominal"
              value={filter.value.equal}
              prefix="Rp"
              allowNegative={false}
              onChange={(e) =>
                handleChange({ value: { ...filter.value, equal: e } })
              }
            />
            {Object.values(filter.value).some((v) => v !== '') && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() =>
                  handleChange({
                    value: {
                      min: '',
                      max: '',
                      equal: '',
                    },
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
          <Stack>
            <Text fw={500} mb={-10}>
              Filter kategori
            </Text>
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                checked={filter.category.includes(category.id)}
                label={category.name}
                onChange={(e) =>
                  handleChange({
                    category: e.currentTarget.checked
                      ? [...filter.category, category.id]
                      : filter.category.filter((f) => f !== category.id),
                  })
                }
              />
            ))}
            {filter.category.length > 0 && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() =>
                  handleChange({
                    category: [],
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
          <Stack>
            <Text fw={500} mb={-10}>
              Filter kantong
            </Text>
            {pockets.map((pocket) => (
              <Checkbox
                key={pocket.id}
                checked={filter.pocket.includes(pocket.id)}
                label={pocket.name}
                onChange={(e) =>
                  handleChange({
                    pocket: e.currentTarget.checked
                      ? [...filter.pocket, pocket.id]
                      : filter.pocket.filter((f) => f !== pocket.id),
                  })
                }
              />
            ))}
            {filter.pocket.length > 0 && (
              <Button
                color={BUTTON_BASE_COLOR}
                onClick={() =>
                  handleChange({
                    pocket: [],
                  })
                }
              >
                Reset
              </Button>
            )}
          </Stack>
        </div>
        <BarChart
          h={300}
          data={chartData}
          dataKey="timePoint"
          series={[
            { name: 'withdraw', color: 'red.6' },
            { name: 'deposit', color: 'teal.6' },
            { name: 'transfer', color: 'violet.6' },
          ]}
          tickLine="y"
        />
      </Stack>
    </Spoiler>
  );
}
