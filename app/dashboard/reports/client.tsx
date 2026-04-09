"use client";

import { useRouter } from "next/navigation";
import {
	Title,
	Group,
	Paper,
	Text,
	Stack,
	SimpleGrid,
	Select,
	ThemeIcon,
	Badge,
	Grid,
	GridCol,
	Divider,
	Progress,
	Center,
} from "@mantine/core";
import {
	IconReportAnalytics,
	IconArrowUp,
	IconArrowDown,
	IconScale,
	IconTrendingUp,
	IconTrendingDown,
	IconReceipt,
	IconChartBar,
	IconChartPie,
	IconCalendar,
	IconWallet,
	IconFlame,
	IconTransfer,
} from "@tabler/icons-react";
import { AreaChart, BarChart, DonutChart } from "@mantine/charts";
import type { ReportData, PeriodType } from "@/app/actions/reports";

// ============================================
// TYPES
// ============================================

interface ReportsClientProps {
	data: ReportData | null;
	period: PeriodType;
	year: number;
	month: number;
	week: number;
	weeks: { value: string; label: string }[];
}

const MONTH_OPTIONS = [
	{ value: "1", label: "Januari" },
	{ value: "2", label: "Februari" },
	{ value: "3", label: "Maret" },
	{ value: "4", label: "April" },
	{ value: "5", label: "Mei" },
	{ value: "6", label: "Juni" },
	{ value: "7", label: "Juli" },
	{ value: "8", label: "Agustus" },
	{ value: "9", label: "September" },
	{ value: "10", label: "Oktober" },
	{ value: "11", label: "November" },
	{ value: "12", label: "Desember" },
];

const PERIOD_OPTIONS = [
	{ value: "weekly", label: "Mingguan" },
	{ value: "monthly", label: "Bulanan" },
	{ value: "yearly", label: "Tahunan" },
];

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
	CASH: "Tunai",
	BANK: "Bank",
	E_WALLET: "E-Wallet",
	CREDIT_CARD: "Kartu Kredit",
	INVESTMENT: "Investasi",
};

// ============================================
// HELPER
// ============================================

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatCompact(amount: number): string {
	if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
	if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
	if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}rb`;
	return String(Math.round(amount));
}

function getYearOptions(): { value: string; label: string }[] {
	const current = new Date().getFullYear();
	const years: { value: string; label: string }[] = [];
	for (let y = current; y >= current - 5; y--) {
		years.push({ value: String(y), label: String(y) });
	}
	return years;
}

// ============================================
// COMPONENT
// ============================================

export function ReportsClient({
	data,
	period,
	year,
	month,
	week,
	weeks,
}: ReportsClientProps) {
	const router = useRouter();

	const updateParams = (updates: Record<string, string>) => {
		const params = new URLSearchParams();
		const current = {
			period,
			year: String(year),
			month: String(month),
			week: String(week),
		};
		const merged = { ...current, ...updates };
		for (const [key, val] of Object.entries(merged)) {
			params.set(key, val);
		}
		router.push(`/dashboard/reports?${params.toString()}`);
	};

	const netBalance = (data?.totalIncome ?? 0) - (data?.totalExpense ?? 0);
	const isPositive = netBalance >= 0;

	return (
		<Stack gap="lg">
			{/* Header */}
			<Group justify="space-between" align="flex-start" wrap="wrap">
				<Group gap="sm">
					<ThemeIcon
						size="lg"
						radius="xl"
						variant="gradient"
						gradient={{ from: "violet", to: "blue", deg: 135 }}
					>
						<IconReportAnalytics size={22} />
					</ThemeIcon>
					<div>
						<Title order={2}>Laporan Keuangan</Title>
						<Text size="sm" c="dimmed">
							Analisis keuangan dan tren transaksi
						</Text>
					</div>
				</Group>
			</Group>

			{/* Period Filters */}
			<Paper p="md" radius="md" withBorder>
				<Group gap="sm" wrap="wrap">
					<Select
						label="Periode"
						data={PERIOD_OPTIONS}
						value={period}
						onChange={(val) => {
							if (val) updateParams({ period: val });
						}}
						w={140}
						size="sm"
					/>
					<Select
						label="Tahun"
						data={getYearOptions()}
						value={String(year)}
						onChange={(val) => {
							if (val) updateParams({ year: val });
						}}
						w={100}
						size="sm"
					/>
					{period !== "yearly" && (
						<Select
							label="Bulan"
							data={MONTH_OPTIONS}
							value={String(month)}
							onChange={(val) => {
								if (val) updateParams({ month: val, week: "1" });
							}}
							w={140}
							size="sm"
						/>
					)}
					{period === "weekly" && (
						<Select
							label="Minggu"
							data={weeks}
							value={String(week)}
							onChange={(val) => {
								if (val) updateParams({ week: val });
							}}
							w={260}
							size="sm"
						/>
					)}
				</Group>
			</Paper>

			{!data ? (
				<Paper p="xl" radius="md" withBorder>
					<Center>
						<Text c="dimmed">Tidak ada data untuk ditampilkan.</Text>
					</Center>
				</Paper>
			) : (
				<>
					{/* Summary Cards */}
					<SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
						<StatCard
							label="Total Pemasukan"
							value={formatCurrency(data.totalIncome)}
							icon={<IconArrowUp size={20} />}
							color="teal"
						/>
						<StatCard
							label="Total Pengeluaran"
							value={formatCurrency(data.totalExpense)}
							icon={<IconArrowDown size={20} />}
							color="red"
						/>
						<StatCard
							label="Arus Bersih"
							value={formatCurrency(netBalance)}
							icon={<IconScale size={20} />}
							color={isPositive ? "blue" : "orange"}
							badge={isPositive ? "Surplus" : "Defisit"}
							badgeColor={isPositive ? "teal" : "red"}
						/>
						<StatCard
							label="Jumlah Transaksi"
							value={String(data.transactionCount)}
							icon={<IconReceipt size={20} />}
							color="grape"
							subtitle={`Rata-rata: ${formatCurrency(data.avgTransaction)}`}
						/>
					</SimpleGrid>

					{/* Transfer Summary (only show if there are transfers) */}
					{data.transferCount > 0 && (
						<Paper p="md" radius="md" withBorder>
							<Group mb="md" gap="xs">
								<ThemeIcon size="sm" variant="light" color="blue" radius="xl">
									<IconTransfer size={14} />
								</ThemeIcon>
								<Text fw={600} size="lg">
									Transfer Antar Akun
								</Text>
								<Badge size="sm" variant="light" color="blue">
									{data.transferCount}x
								</Badge>
							</Group>
							<SimpleGrid cols={{ base: 1, xs: 3 }}>
								<Paper
									p="sm"
									radius="md"
									bg="var(--mantine-color-default-hover)"
								>
									<Text size="xs" c="dimmed" mb={4}>
										Total Ditransfer
									</Text>
									<Text size="lg" fw={700} c="blue">
										{formatCurrency(data.totalTransferred)}
									</Text>
								</Paper>
								<Paper
									p="sm"
									radius="md"
									bg="var(--mantine-color-default-hover)"
								>
									<Text size="xs" c="dimmed" mb={4}>
										Total Biaya Transfer
									</Text>
									<Text size="lg" fw={700} c="orange">
										{formatCurrency(data.totalTransferFees)}
									</Text>
								</Paper>
								<Paper
									p="sm"
									radius="md"
									bg="var(--mantine-color-default-hover)"
								>
									<Text size="xs" c="dimmed" mb={4}>
										Rata-rata Transfer
									</Text>
									<Text size="lg" fw={700}>
										{formatCurrency(data.totalTransferred / data.transferCount)}
									</Text>
								</Paper>
							</SimpleGrid>
							{data.totalTransferFees > 0 && (
								<Text size="xs" c="dimmed" mt="sm">
									* Biaya transfer tidak termasuk dalam perhitungan pengeluaran
									di atas. Total biaya transfer periode ini:{" "}
									{formatCurrency(data.totalTransferFees)}.
								</Text>
							)}
						</Paper>
					)}

					{/* Timeline Chart */}
					<Paper p="md" radius="md" withBorder>
						<Group mb="md" gap="xs">
							<ThemeIcon size="sm" variant="light" color="blue" radius="xl">
								<IconTrendingUp size={14} />
							</ThemeIcon>
							<Text fw={600} size="lg">
								Timeline Pemasukan & Pengeluaran
							</Text>
						</Group>
						<AreaChart
							h={320}
							data={data.timeline}
							dataKey="label"
							series={[
								{ name: "Pemasukan", color: "teal.6" },
								{ name: "Pengeluaran", color: "red.6" },
							]}
							curveType="monotone"
							withDots={period !== "monthly"}
							gridAxis="xy"
							valueFormatter={(value) => formatCompact(value)}
							withLegend
							legendProps={{ verticalAlign: "bottom" }}
						/>
					</Paper>

					{/* Net Flow Chart */}
					<Paper p="md" radius="md" withBorder>
						<Group mb="md" gap="xs">
							<ThemeIcon size="sm" variant="light" color="violet" radius="xl">
								<IconChartBar size={14} />
							</ThemeIcon>
							<Text fw={600} size="lg">
								Arus Kas Bersih
							</Text>
							<Text size="xs" c="dimmed">
								(Pemasukan - Pengeluaran)
							</Text>
						</Group>
						<BarChart
							h={280}
							data={data.netFlow}
							dataKey="label"
							series={[{ name: "Arus Bersih", color: "violet.6" }]}
							gridAxis="xy"
							valueFormatter={(value) => formatCompact(value)}
						/>
					</Paper>

					{/* Category Breakdown */}
					<Grid>
						<GridCol span={{ base: 12, md: 6 }}>
							<Paper p="md" radius="md" withBorder h="100%">
								<Group mb="md" gap="xs">
									<ThemeIcon size="sm" variant="light" color="red" radius="xl">
										<IconChartPie size={14} />
									</ThemeIcon>
									<Text fw={600} size="lg">
										Pengeluaran per Kategori
									</Text>
								</Group>
								{data.expenseByCategory.length > 0 ? (
									<Stack>
										<Center>
											<DonutChart
												data={data.expenseByCategory}
												size={200}
												thickness={28}
												tooltipDataSource="segment"
												chartLabel={formatCompact(data.totalExpense)}
												valueFormatter={(value) => formatCurrency(value)}
											/>
										</Center>
										<Divider />
										<CategoryList
											items={data.expenseByCategory}
											total={data.totalExpense}
										/>
									</Stack>
								) : (
									<EmptyState />
								)}
							</Paper>
						</GridCol>
						<GridCol span={{ base: 12, md: 6 }}>
							<Paper p="md" radius="md" withBorder h="100%">
								<Group mb="md" gap="xs">
									<ThemeIcon size="sm" variant="light" color="teal" radius="xl">
										<IconChartPie size={14} />
									</ThemeIcon>
									<Text fw={600} size="lg">
										Pemasukan per Kategori
									</Text>
								</Group>
								{data.incomeByCategory.length > 0 ? (
									<Stack>
										<Center>
											<DonutChart
												data={data.incomeByCategory}
												size={200}
												thickness={28}
												tooltipDataSource="segment"
												chartLabel={formatCompact(data.totalIncome)}
												valueFormatter={(value) => formatCurrency(value)}
											/>
										</Center>
										<Divider />
										<CategoryList
											items={data.incomeByCategory}
											total={data.totalIncome}
										/>
									</Stack>
								) : (
									<EmptyState />
								)}
							</Paper>
						</GridCol>
					</Grid>

					{/* Daily Pattern */}
					<Paper p="md" radius="md" withBorder>
						<Group mb="md" gap="xs">
							<ThemeIcon size="sm" variant="light" color="orange" radius="xl">
								<IconCalendar size={14} />
							</ThemeIcon>
							<Text fw={600} size="lg">
								Pola Transaksi per Hari
							</Text>
							<Text size="xs" c="dimmed">
								(Agregasi berdasarkan hari dalam seminggu)
							</Text>
						</Group>
						<BarChart
							h={280}
							data={data.dailyPattern}
							dataKey="day"
							type="stacked"
							series={[
								{ name: "Pemasukan", color: "teal.6" },
								{ name: "Pengeluaran", color: "red.6" },
							]}
							gridAxis="xy"
							valueFormatter={(value) => formatCompact(value)}
							withLegend
							legendProps={{ verticalAlign: "bottom" }}
						/>
					</Paper>

					{/* Account Summary & Highlights */}
					<Grid>
						<GridCol span={{ base: 12, md: 7 }}>
							<Paper p="md" radius="md" withBorder h="100%">
								<Group mb="md" gap="xs">
									<ThemeIcon size="sm" variant="light" color="cyan" radius="xl">
										<IconWallet size={14} />
									</ThemeIcon>
									<Text fw={600} size="lg">
										Ringkasan per Akun
									</Text>
								</Group>
								{data.accountSummary.length > 0 ? (
									<Stack gap="sm">
										{data.accountSummary.map((acc) => (
											<AccountRow key={acc.id} account={acc} />
										))}
									</Stack>
								) : (
									<EmptyState />
								)}
							</Paper>
						</GridCol>
						<GridCol span={{ base: 12, md: 5 }}>
							<Paper p="md" radius="md" withBorder h="100%">
								<Group mb="md" gap="xs">
									<ThemeIcon
										size="sm"
										variant="light"
										color="yellow"
										radius="xl"
									>
										<IconFlame size={14} />
									</ThemeIcon>
									<Text fw={600} size="lg">
										Highlight
									</Text>
								</Group>
								<Stack gap="md">
									{data.biggestExpense && (
										<HighlightCard
											label="Pengeluaran Terbesar"
											description={data.biggestExpense.description}
											amount={data.biggestExpense.amount}
											color="red"
											icon={<IconTrendingDown size={16} />}
										/>
									)}
									{data.biggestIncome && (
										<HighlightCard
											label="Pemasukan Terbesar"
											description={data.biggestIncome.description}
											amount={data.biggestIncome.amount}
											color="teal"
											icon={<IconTrendingUp size={16} />}
										/>
									)}
									{data.transactionCount > 0 && (
										<Paper
											p="sm"
											radius="md"
											bg="var(--mantine-color-default-hover)"
										>
											<Text size="xs" c="dimmed" mb={4}>
												Rasio Pemasukan vs Pengeluaran
											</Text>
											<Group gap="xs" mb="xs">
												<Text size="sm" fw={600} c="teal">
													{data.totalIncome + data.totalExpense > 0
														? (
																(data.totalIncome /
																	(data.totalIncome + data.totalExpense)) *
																100
															).toFixed(1)
														: 0}
													%
												</Text>
												<Text size="xs" c="dimmed">
													vs
												</Text>
												<Text size="sm" fw={600} c="red">
													{data.totalIncome + data.totalExpense > 0
														? (
																(data.totalExpense /
																	(data.totalIncome + data.totalExpense)) *
																100
															).toFixed(1)
														: 0}
													%
												</Text>
											</Group>
											<Progress.Root size="lg" radius="xl">
												<Progress.Section
													value={
														data.totalIncome + data.totalExpense > 0
															? (data.totalIncome /
																	(data.totalIncome + data.totalExpense)) *
																100
															: 0
													}
													color="teal"
												>
													<Progress.Label>Masuk</Progress.Label>
												</Progress.Section>
												<Progress.Section
													value={
														data.totalIncome + data.totalExpense > 0
															? (data.totalExpense /
																	(data.totalIncome + data.totalExpense)) *
																100
															: 0
													}
													color="red"
												>
													<Progress.Label>Keluar</Progress.Label>
												</Progress.Section>
											</Progress.Root>
										</Paper>
									)}
									{data.transactionCount === 0 && <EmptyState />}
								</Stack>
							</Paper>
						</GridCol>
					</Grid>
				</>
			)}
		</Stack>
	);
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
	label,
	value,
	icon,
	color,
	badge,
	badgeColor,
	subtitle,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color: string;
	badge?: string;
	badgeColor?: string;
	subtitle?: string;
}) {
	return (
		<Paper p="md" radius="md" withBorder>
			<Group justify="space-between" mb="xs">
				<Text size="xs" c="dimmed" fw={600} tt="uppercase">
					{label}
				</Text>
				<ThemeIcon size="sm" variant="light" color={color} radius="xl">
					{icon}
				</ThemeIcon>
			</Group>
			<Group gap="xs" align="baseline">
				<Text size="xl" fw={700}>
					{value}
				</Text>
				{badge && (
					<Badge size="xs" variant="light" color={badgeColor || color}>
						{badge}
					</Badge>
				)}
			</Group>
			{subtitle && (
				<Text size="xs" c="dimmed" mt={4}>
					{subtitle}
				</Text>
			)}
		</Paper>
	);
}

function CategoryList({
	items,
	total,
}: {
	items: {
		name: string;
		value: number;
		color: string;
		icon: string;
		count: number;
	}[];
	total: number;
}) {
	return (
		<Stack gap="xs">
			{items.map((item, i) => {
				const pct = total > 0 ? (item.value / total) * 100 : 0;
				return (
					<Group key={i} justify="space-between" wrap="nowrap">
						<Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
							<Text size="lg">{item.icon}</Text>
							<div style={{ flex: 1, minWidth: 0 }}>
								<Text size="sm" fw={500} truncate>
									{item.name}
								</Text>
								<Text size="xs" c="dimmed">
									{item.count} transaksi
								</Text>
							</div>
						</Group>
						<div style={{ textAlign: "right" }}>
							<Text size="sm" fw={600}>
								{formatCurrency(item.value)}
							</Text>
							<Text size="xs" c="dimmed">
								{pct.toFixed(1)}%
							</Text>
						</div>
					</Group>
				);
			})}
		</Stack>
	);
}

function AccountRow({
	account,
}: {
	account: {
		id: string;
		name: string;
		type: string;
		balance: number;
		income: number;
		expense: number;
		color: string;
	};
}) {
	const total = account.income + account.expense;
	return (
		<Paper p="sm" radius="md" bg="var(--mantine-color-default-hover)">
			<Group justify="space-between" mb={6}>
				<Group gap="xs">
					<Text size="sm" fw={600}>
						{account.name}
					</Text>
					<Badge size="xs" variant="light" color="gray">
						{ACCOUNT_TYPE_LABELS[account.type] || account.type}
					</Badge>
				</Group>
				<Text size="sm" fw={700}>
					{formatCurrency(account.balance)}
				</Text>
			</Group>
			<Group gap="lg" mb={6}>
				<Group gap={4}>
					<IconArrowUp size={14} color="var(--mantine-color-teal-6)" />
					<Text size="xs" c="teal">
						{formatCurrency(account.income)}
					</Text>
				</Group>
				<Group gap={4}>
					<IconArrowDown size={14} color="var(--mantine-color-red-6)" />
					<Text size="xs" c="red">
						{formatCurrency(account.expense)}
					</Text>
				</Group>
			</Group>
			{total > 0 && (
				<Progress.Root size="sm" radius="xl">
					<Progress.Section
						value={(account.income / total) * 100}
						color="teal"
					/>
					<Progress.Section
						value={(account.expense / total) * 100}
						color="red"
					/>
				</Progress.Root>
			)}
		</Paper>
	);
}

function HighlightCard({
	label,
	description,
	amount,
	color,
	icon,
}: {
	label: string;
	description: string;
	amount: number;
	color: string;
	icon: React.ReactNode;
}) {
	return (
		<Paper p="sm" radius="md" bg="var(--mantine-color-default-hover)">
			<Group gap="xs" mb={4}>
				<ThemeIcon size="xs" variant="light" color={color} radius="xl">
					{icon}
				</ThemeIcon>
				<Text size="xs" c="dimmed" fw={600}>
					{label}
				</Text>
			</Group>
			<Text size="sm" fw={500} truncate>
				{description}
			</Text>
			<Text size="lg" fw={700} c={color}>
				{formatCurrency(amount)}
			</Text>
		</Paper>
	);
}

function EmptyState() {
	return (
		<Center py="xl">
			<Text size="sm" c="dimmed">
				Belum ada data transaksi
			</Text>
		</Center>
	);
}
