"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
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
} from "@mantine/core";
import {
  IconPlus,
  IconArrowsExchange,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
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

interface TransactionsClientProps {
  transactions: TransactionWithRelations[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionsClient({
  transactions,
  accounts,
  categories,
}: TransactionsClientProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithRelations | null>(null);

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
      <Group justify="space-between" mb="lg">
        <Title order={2}>Transaksi</Title>
        {dynamicAddTransactionButton}
      </Group>

      {transactions.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconArrowsExchange size={48} stroke={1} color="gray" />
            <Text c="dimmed" ta="center">
              Belum ada transaksi. Catat transaksi pertamamu!
            </Text>
            {dynamicAddTransactionButton}
          </Stack>
        </Paper>
      ) : (
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
