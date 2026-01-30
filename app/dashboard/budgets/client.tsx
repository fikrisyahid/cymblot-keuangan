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
  Progress,
  Badge,
  ActionIcon,
  Menu,
  SimpleGrid,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconChartBar,
  IconDotsVertical,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { deleteBudget, type BudgetWithSpending } from "@/app/actions/budgets";
import { BudgetModal } from "./components/budget-modal";
import type { Category } from "@/db/schema";

interface BudgetsClientProps {
  budgets: BudgetWithSpending[];
  categories: Category[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export function BudgetsClient({ budgets, categories }: BudgetsClientProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithSpending | null>(null);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleAdd = () => {
    setSelectedBudget(null);
    open();
  };

  const handleEdit = (budget: BudgetWithSpending) => {
    setSelectedBudget(budget);
    open();
  };

  const handleClose = () => {
    setSelectedBudget(null);
    close();
  };

  const handleDelete = async (budget: BudgetWithSpending) => {
    if (!confirm("Yakin ingin menghapus budget ini?")) return;

    const result = await deleteBudget(budget.id);

    if (result.success) {
      notifications.show({
        title: "Berhasil",
        message: "Budget berhasil dihapus",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } else {
      notifications.show({
        title: "Gagal",
        message: result.error || "Gagal menghapus budget",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const BudgetCard = ({ budget }: { budget: BudgetWithSpending }) => {
    const budgetAmount = parseFloat(budget.amount);
    const percentage = Math.min((budget.spent / budgetAmount) * 100, 100);
    const isOverBudget = budget.spent > budgetAmount;
    const isNearLimit = percentage >= 80 && !isOverBudget;

    return (
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Group gap="sm">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--mantine-radius-md)",
                backgroundColor: budget.categoryColor || "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {budget.categoryIcon || "📁"}
            </Box>
            <div>
              <Text fw={500} size="sm">
                {budget.categoryName}
              </Text>
              <Text size="xs" c="dimmed">
                {MONTH_NAMES[budget.month - 1]} {budget.year}
              </Text>
            </div>
          </Group>

          <Menu shadow="md" width={140} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDotsVertical size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => handleEdit(budget)}
              >
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => handleDelete(budget)}
              >
                Hapus
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Progress
          value={percentage}
          color={isOverBudget ? "red" : isNearLimit ? "yellow" : "blue"}
          size="lg"
          radius="xl"
          mb="xs"
        />

        <Group justify="space-between">
          <Text size="sm" c={isOverBudget ? "red" : "dimmed"}>
            {formatCurrency(budget.spent)} / {formatCurrency(budgetAmount)}
          </Text>
          <Badge
            color={isOverBudget ? "red" : isNearLimit ? "yellow" : "green"}
            variant="light"
            size="sm"
          >
            {isOverBudget
              ? "Over Budget!"
              : isNearLimit
                ? "Hampir Limit"
                : `${(100 - percentage).toFixed(0)}% tersisa`}
          </Badge>
        </Group>
      </Paper>
    );
  };

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Anggaran</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
          Tambah Budget
        </Button>
      </Group>

      {budgets.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconChartBar size={48} stroke={1} color="gray" />
            <Text c="dimmed" ta="center">
              Belum ada anggaran untuk bulan ini. Buat anggaran bulanan pertamamu!
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
              Tambah Budget
            </Button>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </SimpleGrid>
      )}

      <BudgetModal
        opened={opened}
        onClose={handleClose}
        categories={categories}
        budget={selectedBudget}
      />
    </>
  );
}
