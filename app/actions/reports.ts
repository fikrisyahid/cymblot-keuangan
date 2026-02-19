"use server";

import { eq, and, gte, lte, desc } from "drizzle-orm";
import db from "@/db";
import { transactions, accounts, transfers } from "@/db/schema";
import { getSession, getEncryptionKey } from "@/lib/auth";
import { decryptTransaction, decryptAccount, decrypt } from "@/lib/encryption";

// ============================================
// TYPES
// ============================================

export type PeriodType = "weekly" | "monthly" | "yearly";

export interface TimelineDataPoint {
  label: string;
  Pemasukan: number;
  Pengeluaran: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
  icon: string;
  count: number;
}

export interface DailyPattern {
  day: string;
  Pemasukan: number;
  Pengeluaran: number;
}

export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  income: number;
  expense: number;
  color: string;
}

export interface BudgetUsageItem {
  categoryName: string;
  categoryIcon: string;
  budgetAmount: number;
  spent: number;
  percentage: number;
  color: string;
}

export interface NetFlowDataPoint {
  label: string;
  "Arus Bersih": number;
}

export interface ReportData {
  timeline: TimelineDataPoint[];
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
  dailyPattern: DailyPattern[];
  accountSummary: AccountSummary[];
  netFlow: NetFlowDataPoint[];
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  avgTransaction: number;
  biggestExpense: { amount: number; description: string; date: Date } | null;
  biggestIncome: { amount: number; description: string; date: Date } | null;
  // Transfer data
  transferCount: number;
  totalTransferred: number;
  totalTransferFees: number;
}

// ============================================
// HELPER: Date range calculation
// ============================================

function getDateRange(
  period: PeriodType,
  year: number,
  month: number,
  week?: number
): { start: Date; end: Date } {
  if (period === "yearly") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }

  if (period === "monthly") {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59, 999),
    };
  }

  // weekly - get the Nth week of the given month/year
  const weekNum = week ?? 1;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // First Monday of the month (or the Monday before the 1st)
  const firstMonday = new Date(firstDayOfMonth);
  firstMonday.setDate(firstDayOfMonth.getDate() - diffToMonday);

  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}

/**
 * Get weeks available in a given month/year
 */
export async function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const dayOfWeek = firstDay.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const firstMonday = new Date(firstDay);
  firstMonday.setDate(firstDay.getDate() - diffToMonday);

  const weeks: { value: string; label: string }[] = [];
  let weekStart = new Date(firstMonday);
  let weekNum = 1;

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = `${weekStart.getDate()}`;
    const endStr = `${weekEnd.getDate()}`;
    const startMonth = weekStart.toLocaleString("id-ID", { month: "short" });
    const endMonth = weekEnd.toLocaleString("id-ID", { month: "short" });

    const label =
      weekStart.getMonth() === weekEnd.getMonth()
        ? `Minggu ${weekNum} (${startStr} - ${endStr} ${startMonth})`
        : `Minggu ${weekNum} (${startStr} ${startMonth} - ${endStr} ${endMonth})`;

    weeks.push({ value: String(weekNum), label });

    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  return weeks;
}

// ============================================
// MAIN REPORT DATA FETCHER
// ============================================

export async function getReportData(
  period: PeriodType,
  year: number,
  month: number,
  week?: number
): Promise<ReportData | null> {
  const session = await getSession();
  if (!session) return null;

  const key = await getEncryptionKey();
  const { start, end } = getDateRange(period, year, month, week);

  // Fetch all transactions in range
  const rawTxns = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, session.userId),
      gte(transactions.date, start),
      lte(transactions.date, end)
    ),
    with: {
      account: true,
      category: true,
    },
    orderBy: [desc(transactions.date)],
  });

  // Fetch all accounts
  const rawAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, session.userId),
  });

  // Fetch transfers in range
  const rawTransfers = await db.query.transfers.findMany({
    where: and(
      eq(transfers.userId, session.userId),
      gte(transfers.date, start),
      lte(transfers.date, end)
    ),
  });

  // Decrypt data
  const txns = key
    ? await Promise.all(rawTxns.map((t) => decryptTransaction(t, key)))
    : rawTxns;
  const userAccounts = key
    ? await Promise.all(rawAccounts.map((a) => decryptAccount(a, key)))
    : rawAccounts;

  // Decrypt transfers
  const decryptedTransfers = key
    ? await Promise.all(
        rawTransfers.map(async (tf) => ({
          ...tf,
          amount: await decrypt(tf.amount, key),
          fee: tf.fee ? await decrypt(tf.fee, key) : "0",
        }))
      )
    : rawTransfers;

  // ---- TIMELINE ----
  const timeline = buildTimeline(txns, period, start);

  // ---- CATEGORY BREAKDOWN ----
  const expenseByCategory = buildCategoryBreakdown(txns, "EXPENSE");
  const incomeByCategory = buildCategoryBreakdown(txns, "INCOME");

  // ---- DAILY PATTERN (day of week) ----
  const dailyPattern = buildDailyPattern(txns);

  // ---- ACCOUNT SUMMARY ----
  const accountSummary = buildAccountSummary(txns, userAccounts);

  // ---- NET FLOW ----
  const netFlow = buildNetFlow(txns, period, start);

  // ---- STATS ----
  const totalIncome = txns
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = txns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const transactionCount = txns.length;
  const avgTransaction =
    transactionCount > 0
      ? txns.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactionCount
      : 0;

  const expenseTxns = txns.filter((t) => t.type === "EXPENSE");
  const incomeTxns = txns.filter((t) => t.type === "INCOME");

  const biggestExpense =
    expenseTxns.length > 0
      ? expenseTxns.reduce(
          (max, t) =>
            parseFloat(t.amount) > max.amount
              ? { amount: parseFloat(t.amount), description: t.description, date: t.date }
              : max,
          { amount: 0, description: "", date: new Date() }
        )
      : null;

  const biggestIncome =
    incomeTxns.length > 0
      ? incomeTxns.reduce(
          (max, t) =>
            parseFloat(t.amount) > max.amount
              ? { amount: parseFloat(t.amount), description: t.description, date: t.date }
              : max,
          { amount: 0, description: "", date: new Date() }
        )
      : null;

  // ---- TRANSFER STATS ----
  const transferCount = decryptedTransfers.length;
  const totalTransferred = decryptedTransfers.reduce(
    (sum, tf) => sum + parseFloat(tf.amount),
    0,
  );
  const totalTransferFees = decryptedTransfers.reduce(
    (sum, tf) => sum + parseFloat(tf.fee || "0"),
    0,
  );

  return {
    timeline,
    expenseByCategory,
    incomeByCategory,
    dailyPattern,
    accountSummary,
    netFlow,
    totalIncome,
    totalExpense,
    transactionCount,
    avgTransaction,
    biggestExpense,
    biggestIncome,
    transferCount,
    totalTransferred,
    totalTransferFees,
  };
}

// ============================================
// BUILDER FUNCTIONS
// ============================================

type TransactionWithRelations = {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  date: Date;
  accountId: string;
  account: { id: string; name: string; type: string; color: string | null };
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
};

function buildTimeline(
  txns: TransactionWithRelations[],
  period: PeriodType,
  start: Date
): TimelineDataPoint[] {
  const map = new Map<string, { income: number; expense: number }>();

  if (period === "yearly") {
    // Group by month
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    for (let i = 0; i < 12; i++) {
      map.set(monthNames[i], { income: 0, expense: 0 });
    }
    for (const txn of txns) {
      const m = monthNames[txn.date.getMonth()];
      const entry = map.get(m)!;
      const amount = parseFloat(txn.amount);
      if (txn.type === "INCOME") entry.income += amount;
      else entry.expense += amount;
    }
  } else if (period === "monthly") {
    // Group by day
    const daysInMonth =
      new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      map.set(String(d), { income: 0, expense: 0 });
    }
    for (const txn of txns) {
      const d = String(txn.date.getDate());
      const entry = map.get(d);
      if (entry) {
        const amount = parseFloat(txn.amount);
        if (txn.type === "INCOME") entry.income += amount;
        else entry.expense += amount;
      }
    }
  } else {
    // weekly: group by day name
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const current = new Date(start);
    for (let i = 0; i < 7; i++) {
      const dateStr = `${dayNames[i]} ${current.getDate()}/${current.getMonth() + 1}`;
      map.set(dateStr, { income: 0, expense: 0 });
      current.setDate(current.getDate() + 1);
    }
    for (const txn of txns) {
      const dayIdx = txn.date.getDay();
      const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1; // Monday=0
      const txnDate = new Date(start);
      txnDate.setDate(start.getDate() + mappedIdx);
      const key = `${dayNames[mappedIdx]} ${txnDate.getDate()}/${txnDate.getMonth() + 1}`;
      const entry = map.get(key);
      if (entry) {
        const amount = parseFloat(txn.amount);
        if (txn.type === "INCOME") entry.income += amount;
        else entry.expense += amount;
      }
    }
  }

  return Array.from(map.entries()).map(([label, data]) => ({
    label,
    Pemasukan: data.income,
    Pengeluaran: data.expense,
  }));
}

function buildCategoryBreakdown(
  txns: TransactionWithRelations[],
  type: "INCOME" | "EXPENSE"
): CategoryBreakdown[] {
  const filtered = txns.filter((t) => t.type === type);
  const categoryMap = new Map<
    string,
    { name: string; total: number; icon: string; count: number }
  >();

  // Palette of distinct Mantine colors for the chart
  const palette = [
    "blue.6", "teal.6", "grape.6", "orange.6", "cyan.6",
    "pink.6", "indigo.6", "lime.6", "yellow.6", "red.6",
    "violet.6", "green.6",
  ];

  for (const txn of filtered) {
    const key = txn.category?.id || "__uncategorized__";
    const existing = categoryMap.get(key);
    const amount = parseFloat(txn.amount);

    if (existing) {
      existing.total += amount;
      existing.count += 1;
    } else {
      categoryMap.set(key, {
        name: txn.category?.name || "Tanpa Kategori",
        total: amount,
        icon: txn.category?.icon || "📦",
        count: 1,
      });
    }
  }

  return Array.from(categoryMap.values())
    .map((c, idx) => ({
      name: c.name,
      value: c.total,
      color: palette[idx % palette.length],
      icon: c.icon,
      count: c.count,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildDailyPattern(txns: TransactionWithRelations[]): DailyPattern[] {
  const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const pattern = dayNames.map((day) => ({
    day,
    Pemasukan: 0,
    Pengeluaran: 0,
  }));

  for (const txn of txns) {
    const jsDay = txn.date.getDay(); // 0=Sunday
    const idx = jsDay === 0 ? 6 : jsDay - 1; // Monday=0
    const amount = parseFloat(txn.amount);
    if (txn.type === "INCOME") pattern[idx].Pemasukan += amount;
    else pattern[idx].Pengeluaran += amount;
  }

  return pattern;
}

function buildAccountSummary(
  txns: TransactionWithRelations[],
  userAccounts: { id: string; name: string; type: string; balance: string; color: string | null }[]
): AccountSummary[] {
  const accountMap = new Map<string, { income: number; expense: number }>();

  for (const txn of txns) {
    const existing = accountMap.get(txn.accountId);
    const amount = parseFloat(txn.amount);
    if (existing) {
      if (txn.type === "INCOME") existing.income += amount;
      else existing.expense += amount;
    } else {
      accountMap.set(txn.accountId, {
        income: txn.type === "INCOME" ? amount : 0,
        expense: txn.type === "EXPENSE" ? amount : 0,
      });
    }
  }

  return userAccounts.map((acc) => {
    const flow = accountMap.get(acc.id) || { income: 0, expense: 0 };
    return {
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: parseFloat(acc.balance),
      income: flow.income,
      expense: flow.expense,
      color: acc.color || "blue",
    };
  });
}

function buildNetFlow(
  txns: TransactionWithRelations[],
  period: PeriodType,
  start: Date
): NetFlowDataPoint[] {
  const map = new Map<string, number>();

  if (period === "yearly") {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    for (const m of monthNames) map.set(m, 0);
    for (const txn of txns) {
      const m = monthNames[txn.date.getMonth()];
      const amount = parseFloat(txn.amount);
      map.set(m, (map.get(m) || 0) + (txn.type === "INCOME" ? amount : -amount));
    }
  } else if (period === "monthly") {
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) map.set(String(d), 0);
    for (const txn of txns) {
      const d = String(txn.date.getDate());
      const amount = parseFloat(txn.amount);
      map.set(d, (map.get(d) || 0) + (txn.type === "INCOME" ? amount : -amount));
    }
  } else {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const current = new Date(start);
    for (let i = 0; i < 7; i++) {
      map.set(`${dayNames[i]} ${current.getDate()}/${current.getMonth() + 1}`, 0);
      current.setDate(current.getDate() + 1);
    }
    for (const txn of txns) {
      const dayIdx = txn.date.getDay();
      const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      const txnDate = new Date(start);
      txnDate.setDate(start.getDate() + mappedIdx);
      const key = `${dayNames[mappedIdx]} ${txnDate.getDate()}/${txnDate.getMonth() + 1}`;
      const amount = parseFloat(txn.amount);
      map.set(key, (map.get(key) || 0) + (txn.type === "INCOME" ? amount : -amount));
    }
  }

  return Array.from(map.entries()).map(([label, val]) => ({
    label,
    "Arus Bersih": val,
  }));
}
