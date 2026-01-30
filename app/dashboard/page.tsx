import { getSession } from "@/lib/auth";
import { getAccounts } from "@/app/actions/accounts";
import {
  getRecentTransactions,
  getMonthlySummary,
} from "@/app/actions/transactions";
import { getBudgetsWithSpending } from "@/app/actions/budgets";
import { getDebts } from "@/app/actions/debts";
import { getRecurringTransactions } from "@/app/actions/recurring";
import {
  Title,
  Text,
  Paper,
  SimpleGrid,
  Group,
  ThemeIcon,
  Table,
  Badge,
  Stack,
  Progress,
  Box,
  Grid,
  GridCol,
} from "@mantine/core";
import {
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconScale,
  IconChartBar,
  IconReceipt,
  IconCash,
} from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default async function DashboardPage() {
  const session = await getSession();
  const now = new Date();

  const [
    accounts,
    recentTransactions,
    monthlySummary,
    budgets,
    debts,
    recurring,
  ] = await Promise.all([
    getAccounts(),
    getRecentTransactions(5),
    getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
    getBudgetsWithSpending(),
    getDebts(),
    getRecurringTransactions(),
  ]);

  // Calculate totals
  const totalBalance = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + parseFloat(a.balance), 0);

  // Debt summary
  const totalUtang = debts
    .filter((d) => d.type === "BORROW" && !d.isPaid)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const totalPiutang = debts
    .filter((d) => d.type === "LEND" && !d.isPaid)
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  // Upcoming recurring (next 7 days)
  const upcomingRecurring = recurring
    .filter((r) => {
      if (!r.isActive) return false;
      const dueDate = new Date(r.nextDueDate);
      const diff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Title order={2} mb="lg">
        Selamat datang, {session?.email?.split("@")[0]}! 👋
      </Title>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md" mb="xl">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Saldo
              </Text>
              <Text size="xl" fw={700}>
                {formatCurrency(totalBalance)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconWallet size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Pemasukan Bulan Ini
              </Text>
              <Text size="xl" fw={700} c="green">
                {formatCurrency(monthlySummary.income)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconArrowUp size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Pengeluaran Bulan Ini
              </Text>
              <Text size="xl" fw={700} c="red">
                {formatCurrency(monthlySummary.expense)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="red">
              <IconArrowDown size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Selisih
              </Text>
              <Text
                size="xl"
                fw={700}
                c={
                  monthlySummary.income - monthlySummary.expense >= 0
                    ? "green"
                    : "red"
                }
              >
                {formatCurrency(monthlySummary.income - monthlySummary.expense)}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconScale size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      <Grid gutter="md" mb="xl">
        {/* Budget Progress */}
        <GridCol span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconChartBar size={20} />
                <Title order={4}>Anggaran Bulan Ini</Title>
              </Group>
              <Link
                href="/dashboard/budgets"
                className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium"
              >
                Lihat semua
              </Link>
            </Group>

            {budgets.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                Belum ada anggaran
              </Text>
            ) : (
              <Stack gap="sm">
                {budgets.slice(0, 4).map((budget) => {
                  const budgetAmount = parseFloat(budget.amount);
                  const percentage = Math.min(
                    (budget.spent / budgetAmount) * 100,
                    100,
                  );
                  const isOverBudget = budget.spent > budgetAmount;

                  return (
                    <Box key={budget.id}>
                      <Group justify="space-between" mb={4}>
                        <Group gap="xs">
                          <Text size="sm">{budget.categoryIcon}</Text>
                          <Text size="sm" fw={500}>
                            {budget.categoryName}
                          </Text>
                        </Group>
                        <Text size="xs" c={isOverBudget ? "red" : "dimmed"}>
                          {formatCurrency(budget.spent)} /{" "}
                          {formatCurrency(budgetAmount)}
                        </Text>
                      </Group>
                      <Progress
                        value={percentage}
                        color={
                          isOverBudget
                            ? "red"
                            : percentage >= 80
                              ? "yellow"
                              : "blue"
                        }
                        size="sm"
                        radius="xl"
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </GridCol>

        {/* Utang & Piutang Summary */}
        <GridCol span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconCash size={20} />
                <Title order={4}>Utang & Piutang</Title>
              </Group>
              <Link
                href="/dashboard/debts"
                className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium"
              >
                Lihat semua
              </Link>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <Paper p="sm" radius="md" withBorder>
                <Text size="xs" c="dimmed" mb={4}>
                  Total Utang
                </Text>
                <Text size="lg" fw={700} c="red">
                  {formatCurrency(totalUtang)}
                </Text>
                <Text size="xs" c="dimmed">
                  {debts.filter((d) => d.type === "BORROW" && !d.isPaid).length}{" "}
                  belum lunas
                </Text>
              </Paper>

              <Paper p="sm" radius="md" withBorder>
                <Text size="xs" c="dimmed" mb={4}>
                  Total Piutang
                </Text>
                <Text size="lg" fw={700} c="green">
                  {formatCurrency(totalPiutang)}
                </Text>
                <Text size="xs" c="dimmed">
                  {debts.filter((d) => d.type === "LEND" && !d.isPaid).length}{" "}
                  belum lunas
                </Text>
              </Paper>
            </SimpleGrid>

            {/* Overdue debts warning */}
            {debts.filter(
              (d) => !d.isPaid && d.dueDate && new Date(d.dueDate) < now,
            ).length > 0 && (
              <Paper p="sm" radius="md" bg="red.1" mt="md">
                <Text size="sm" c="red" fw={500}>
                  ⚠️{" "}
                  {
                    debts.filter(
                      (d) =>
                        !d.isPaid && d.dueDate && new Date(d.dueDate) < now,
                    ).length
                  }{" "}
                  item sudah jatuh tempo!
                </Text>
              </Paper>
            )}
          </Paper>
        </GridCol>
      </Grid>

      <Grid gutter="md">
        {/* Recent Transactions */}
        <GridCol span={{ base: 12, md: 8 }}>
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={4}>Transaksi Terakhir</Title>
              <Link
                href="/dashboard/transactions"
                className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium"
              >
                Lihat semua
              </Link>
            </Group>

            {recentTransactions.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                Belum ada transaksi
              </Text>
            ) : (
              <Table.ScrollContainer minWidth={400}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Transaksi</Table.Th>
                      <Table.Th>Akun</Table.Th>
                      <Table.Th ta="right">Nominal</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentTransactions.map((txn) => (
                      <Table.Tr key={txn.id}>
                        <Table.Td>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {txn.description}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {dayjs(txn.date).format("DD MMM YYYY")}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {txn.account?.icon} {txn.account?.name}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text
                            fw={600}
                            c={txn.type === "INCOME" ? "green" : "red"}
                            size="sm"
                          >
                            {txn.type === "INCOME" ? "+" : "-"}
                            {formatCurrency(parseFloat(txn.amount))}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </GridCol>

        {/* Upcoming Recurring */}
        <GridCol span={{ base: 12, md: 4 }}>
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconReceipt size={20} />
                <Title order={4}>Tagihan Mendatang</Title>
              </Group>
              <Link
                href="/dashboard/recurring"
                className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium"
              >
                Lihat semua
              </Link>
            </Group>

            {upcomingRecurring.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                Tidak ada tagihan dalam 7 hari
              </Text>
            ) : (
              <Stack gap="sm">
                {upcomingRecurring.map((item) => (
                  <Paper key={item.id} p="sm" radius="md" withBorder>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={500}>
                        {item.description}
                      </Text>
                      <Badge
                        size="xs"
                        color={item.type === "INCOME" ? "green" : "red"}
                        variant="light"
                      >
                        {item.type === "INCOME" ? "Masuk" : "Keluar"}
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {dayjs(item.nextDueDate).format("DD MMM YYYY")}
                      </Text>
                      <Text
                        size="sm"
                        fw={600}
                        c={item.type === "INCOME" ? "green" : "red"}
                      >
                        {formatCurrency(parseFloat(item.amount))}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </GridCol>
      </Grid>
    </>
  );
}
