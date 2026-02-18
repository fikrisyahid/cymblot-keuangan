"use client";

import { useState, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Title,
  Button,
  Group,
  Paper,
  Text,
  Stack,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Tooltip,
  Select,
  TextInput,
  Pagination,
  Collapse,
  SimpleGrid,
  Flex,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconArrowsExchange,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconFilter,
  IconFilterOff,
  IconSearch,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { TransactionModal } from "./components/transaction-modal";
import { deleteTransaction } from "@/app/actions/transactions";
import type { Account, Category, Transaction } from "@/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

type TransactionWithRelations = Transaction & {
  account: Account;
  category: Category | null;
};

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  type: string;
  accountId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  search: string;
}

interface TransactionsClientProps {
  transactions: TransactionWithRelations[];
  accounts: Account[];
  categories: Category[];
  pagination: PaginationInfo;
  currentFilters: FilterState;
}

export function TransactionsClient({
  transactions,
  accounts,
  categories,
  pagination,
  currentFilters,
}: TransactionsClientProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(
    !!(currentFilters.type || currentFilters.accountId || currentFilters.categoryId || currentFilters.startDate || currentFilters.endDate)
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithRelations | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [filterType, setFilterType] = useState(currentFilters.type || "");
  const [filterAccountId, setFilterAccountId] = useState(currentFilters.accountId || "");
  const [filterCategoryId, setFilterCategoryId] = useState(currentFilters.categoryId || "");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : null
  );
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : null
  );
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || "");

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = {
        type: filterType,
        accountId: filterAccountId,
        categoryId: filterCategoryId,
        startDate: filterStartDate ? filterStartDate.toISOString() : "",
        endDate: filterEndDate ? filterEndDate.toISOString() : "",
        search: searchQuery,
        page: "1",
        ...overrides,
      };

      Object.entries(merged).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      return `/dashboard/transactions?${params.toString()}`;
    },
    [filterType, filterAccountId, filterCategoryId, filterStartDate, filterEndDate, searchQuery]
  );

  const applyFilters = () => {
    router.push(buildUrl({ page: "1" }));
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterAccountId("");
    setFilterCategoryId("");
    setFilterStartDate(null);
    setFilterEndDate(null);
    setSearchQuery("");
    router.push("/dashboard/transactions");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/dashboard/transactions?${params.toString()}`);
  };

  const handleEdit = (transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction);
    open();
  };

  const handleClose = () => {
    setSelectedTransaction(null);
    close();
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    open();
  };

  const handleDelete = async (transaction: TransactionWithRelations) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

    const result = await deleteTransaction(transaction.id);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Transaksi berhasil dihapus",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal menghapus transaksi",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const hasActiveFilters = !!(
    currentFilters.type ||
    currentFilters.accountId ||
    currentFilters.categoryId ||
    currentFilters.startDate ||
    currentFilters.endDate ||
    currentFilters.search
  );

  const rows = transactions.map((txn) => (
    <Table.Tr key={txn.id}>
      <Table.Td>
        <Group gap="xs">
          {txn.type === "INCOME" ? (
            <IconArrowUp size={16} color="green" />
          ) : (
            <IconArrowDown size={16} color="red" />
          )}
          <div>
            <Text size="sm" fw={500}>
              {txn.description}
            </Text>
            <Text size="xs" c="dimmed">
              {dayjs(txn.date).format("DD MMM YYYY")}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" size="sm">
          {txn.account?.icon} {txn.account?.name}
        </Badge>
      </Table.Td>
      <Table.Td>
        {txn.category && (
          <Badge variant="dot" size="sm" color={txn.category.color || "gray"}>
            {txn.category.icon} {txn.category.name}
          </Badge>
        )}
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={600} c={txn.type === "INCOME" ? "green" : "red"} size="sm">
          {txn.type === "INCOME" ? "+" : "-"}
          {formatCurrency(txn.amount)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Menu shadow="md" width={140} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={() => handleEdit(txn)}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={() => handleDelete(txn)}
            >
              Hapus
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  const dynamicAddTransactionButton =
    accounts.length === 0 ? (
      <Tooltip label="Tambahkan akun terlebih dahulu" withArrow>
        <Button leftSection={<IconPlus size={16} />} disabled>
          Tambah Transaksi
        </Button>
      </Tooltip>
    ) : (
      <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
        Tambah Transaksi
      </Button>
    );

  return (
    <>
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Title order={2}>Transaksi</Title>
        <Group gap="sm" wrap="nowrap">
          <Button
            variant={hasActiveFilters ? "filled" : "light"}
            leftSection={hasActiveFilters ? <IconFilterOff size={16} /> : <IconFilter size={16} />}
            onClick={hasActiveFilters ? clearFilters : toggleFilter}
            color={hasActiveFilters ? "red" : "blue"}
          >
            {hasActiveFilters ? "Reset Filter" : "Filter"}
          </Button>
          {dynamicAddTransactionButton}
        </Group>
      </Group>

      {/* Search Bar */}
      <Paper p="sm" radius="md" withBorder mb="sm">
        <Flex gap="sm" align="end">
          <TextInput
            placeholder="Cari deskripsi transaksi..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            style={{ flex: 1 }}
          />
          <Button onClick={applyFilters} variant="filled">
            Cari
          </Button>
        </Flex>
      </Paper>

      {/* Filter Panel */}
      <Collapse in={filterOpened}>
        <Paper p="md" radius="md" withBorder mb="md" bg="var(--mantine-color-body)">
          <Text fw={600} size="sm" mb="sm">
            Filter Transaksi
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            <Select
              label="Tipe"
              placeholder="Semua tipe"
              value={filterType || null}
              onChange={(v) => setFilterType(v || "")}
              data={[
                { value: "INCOME", label: "Pemasukan" },
                { value: "EXPENSE", label: "Pengeluaran" },
              ]}
              clearable
            />
            <Select
              label="Akun"
              placeholder="Semua akun"
              value={filterAccountId || null}
              onChange={(v) => setFilterAccountId(v || "")}
              data={accounts.map((a) => ({
                value: a.id,
                label: `${a.icon || ""} ${a.name}`,
              }))}
              clearable
            />
            <Select
              label="Kategori"
              placeholder="Semua kategori"
              value={filterCategoryId || null}
              onChange={(v) => setFilterCategoryId(v || "")}
              data={categories.map((c) => ({
                value: c.id,
                label: `${c.icon || ""} ${c.name}`,
              }))}
              clearable
            />
            <div />
            <DatePickerInput
              label="Dari tanggal"
              placeholder="Pilih tanggal"
              value={filterStartDate}
              onChange={(val) => setFilterStartDate(val as Date | null)}
              clearable
              locale="id"
            />
            <DatePickerInput
              label="Sampai tanggal"
              placeholder="Pilih tanggal"
              value={filterEndDate}
              onChange={(val) => setFilterEndDate(val as Date | null)}
              clearable
              locale="id"
            />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={clearFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Terapkan Filter</Button>
          </Group>
        </Paper>
      </Collapse>

      {/* Active filters badge summary */}
      {hasActiveFilters && (
        <Group gap="xs" mb="sm">
          <Text size="xs" c="dimmed">
            Filter aktif:
          </Text>
          {currentFilters.type && (
            <Badge size="sm" variant="light">
              {currentFilters.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </Badge>
          )}
          {currentFilters.accountId && (
            <Badge size="sm" variant="light" color="cyan">
              {accounts.find((a) => a.id === currentFilters.accountId)?.name || "Akun"}
            </Badge>
          )}
          {currentFilters.categoryId && (
            <Badge size="sm" variant="light" color="grape">
              {categories.find((c) => c.id === currentFilters.categoryId)?.name || "Kategori"}
            </Badge>
          )}
          {(currentFilters.startDate || currentFilters.endDate) && (
            <Badge size="sm" variant="light" color="orange">
              {currentFilters.startDate
                ? dayjs(currentFilters.startDate).format("DD/MM/YY")
                : "..."}
              {" - "}
              {currentFilters.endDate
                ? dayjs(currentFilters.endDate).format("DD/MM/YY")
                : "..."}
            </Badge>
          )}
          {currentFilters.search && (
            <Badge size="sm" variant="light" color="teal">
              &quot;{currentFilters.search}&quot;
            </Badge>
          )}
          <Text size="xs" c="dimmed">
            ({pagination.total} hasil)
          </Text>
        </Group>
      )}

      {transactions.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconArrowsExchange size={48} stroke={1} color="gray" />
            <Text c="dimmed" ta="center">
              {hasActiveFilters
                ? "Tidak ada transaksi yang cocok dengan filter."
                : "Belum ada transaksi. Catat transaksi pertamamu!"}
            </Text>
            {!hasActiveFilters && dynamicAddTransactionButton}
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper radius="md" withBorder>
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Transaksi</Table.Th>
                    <Table.Th>Akun</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th ta="right">Nominal</Table.Th>
                    <Table.Th w={50}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Flex justify="space-between" align="center" mt="md">
              <Text size="sm" c="dimmed">
                Menampilkan {(pagination.page - 1) * pagination.perPage + 1}-
                {Math.min(pagination.page * pagination.perPage, pagination.total)}{" "}
                dari {pagination.total} transaksi
              </Text>
              <Pagination
                value={pagination.page}
                total={pagination.totalPages}
                onChange={handlePageChange}
                size="sm"
              />
            </Flex>
          )}
        </>
      )}

      <TransactionModal
        opened={opened}
        onClose={handleClose}
        accounts={accounts}
        categories={categories}
        transaction={selectedTransaction}
      />
    </>
  );
}
