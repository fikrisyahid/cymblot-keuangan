import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { getAccounts } from "@/app/actions/accounts";
import {
	getRecentTransactions,
	getMonthlySummary,
	getTopTransactions,
	getCategorySummary,
} from "@/app/actions/transactions";
import { getBudgetsWithSpending } from "@/app/actions/budgets";
import { getDebts } from "@/app/actions/debts";
import { getRecurringTransactions } from "@/app/actions/recurring";
import {
	getMonthlyTransferSummary,
	getRecentTransfers,
} from "@/app/actions/transfers";
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
	TableScrollContainer,
	TableThead,
	TableTr,
	TableTh,
	TableTbody,
	TableTd,
	RingProgress,
	Divider,
} from "@mantine/core";
import {
	IconWallet,
	IconArrowUp,
	IconArrowDown,
	IconScale,
	IconChartBar,
	IconReceipt,
	IconCash,
	IconTrendingUp,
	IconTrendingDown,
	IconCalendarWeek,
	IconCategory,
	IconFlame,
	IconArrowsExchange,
	IconArrowRight,
	IconTransfer,
} from "@tabler/icons-react";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/id";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

dayjs.locale("id");

async function DashboardContent() {
	const session = await getSession();
	const now = new Date();

	// Date ranges
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const monthEnd = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59,
	);

	// Week start (Monday)
	const dayOfWeek = now.getDay();
	const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - diffToMonday);
	weekStart.setHours(0, 0, 0, 0);
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	weekEnd.setHours(23, 59, 59, 999);

	const [
		accounts,
		recentTransactions,
		monthlySummary,
		budgets,
		debts,
		recurring,
		topExpensesMonth,
		topIncomeMonth,
		// Category summaries
		expenseCategoriesMonth,
		incomeCategoriesMonth,
		expenseCategoriesWeek,
		incomeCategoriesWeek,
		// Transfer data
		monthlyTransferSummary,
		recentTransfersList,
	] = await Promise.all([
		getAccounts(),
		getRecentTransactions(5),
		getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
		getBudgetsWithSpending({ monthly: true }),
		getDebts(),
		getRecurringTransactions(),
		getTopTransactions("EXPENSE", monthStart, monthEnd, 5),
		getTopTransactions("INCOME", monthStart, monthEnd, 5),
		getCategorySummary("EXPENSE", monthStart, monthEnd, 6),
		getCategorySummary("INCOME", monthStart, monthEnd, 6),
		getCategorySummary("EXPENSE", weekStart, weekEnd, 5),
		getCategorySummary("INCOME", weekStart, weekEnd, 5),
		getMonthlyTransferSummary(now.getFullYear(), now.getMonth() + 1),
		getRecentTransfers(5),
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

	// Category color palette for ring chart
	const categoryColors = [
		"var(--mantine-color-blue-6)",
		"var(--mantine-color-teal-6)",
		"var(--mantine-color-orange-6)",
		"var(--mantine-color-grape-6)",
		"var(--mantine-color-cyan-6)",
		"var(--mantine-color-pink-6)",
	];

	const totalExpenseCategories = expenseCategoriesMonth.reduce(
		(s, c) => s + c.total,
		0,
	);
	const totalIncomeCategories = incomeCategoriesMonth.reduce(
		(s, c) => s + c.total,
		0,
	);

	return (
		<>
			<Title order={2} mb="lg">
				Selamat datang, {session?.name}! 👋
			</Title>

			{/* Quick Stats */}
			<SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md" mb="xl">
				<Paper
					p="md"
					radius="md"
					style={{
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						color: "white",
					}}
				>
					<Group justify="space-between">
						<div>
							<Text size="xs" tt="uppercase" fw={700} style={{ opacity: 0.85 }}>
								Total Saldo
							</Text>
							<Text size="xl" fw={700} c="white">
								{formatCurrency(totalBalance)}
							</Text>
						</div>
						<ThemeIcon
							size="lg"
							radius="md"
							variant="filled"
							style={{ background: "rgba(255,255,255,0.2)" }}
						>
							<IconWallet size={20} color="white" />
						</ThemeIcon>
					</Group>
				</Paper>

				<Paper
					p="md"
					radius="md"
					style={{
						background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
						color: "white",
					}}
				>
					<Group justify="space-between">
						<div>
							<Text size="xs" tt="uppercase" fw={700} style={{ opacity: 0.85 }}>
								Pemasukan Bulan Ini
							</Text>
							<Text size="xl" fw={700} c="white">
								{formatCurrency(monthlySummary.income)}
							</Text>
						</div>
						<ThemeIcon
							size="lg"
							radius="md"
							variant="filled"
							style={{ background: "rgba(255,255,255,0.2)" }}
						>
							<IconArrowUp size={20} color="white" />
						</ThemeIcon>
					</Group>
				</Paper>

				<Paper
					p="md"
					radius="md"
					style={{
						background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
						color: "white",
					}}
				>
					<Group justify="space-between">
						<div>
							<Text size="xs" tt="uppercase" fw={700} style={{ opacity: 0.85 }}>
								Pengeluaran Bulan Ini
							</Text>
							<Text size="xl" fw={700} c="white">
								{formatCurrency(monthlySummary.expense)}
							</Text>
						</div>
						<ThemeIcon
							size="lg"
							radius="md"
							variant="filled"
							style={{ background: "rgba(255,255,255,0.2)" }}
						>
							<IconArrowDown size={20} color="white" />
						</ThemeIcon>
					</Group>
				</Paper>

				<Paper
					p="md"
					radius="md"
					style={{
						background:
							monthlySummary.income - monthlySummary.expense >= 0
								? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
								: "linear-gradient(135deg, #a8071a 0%, #cf1322 100%)",
						color: "white",
					}}
				>
					<Group justify="space-between">
						<div>
							<Text size="xs" tt="uppercase" fw={700} style={{ opacity: 0.85 }}>
								Selisih
							</Text>
							<Text size="xl" fw={700} c="white">
								{formatCurrency(monthlySummary.income - monthlySummary.expense)}
							</Text>
						</div>
						<ThemeIcon
							size="lg"
							radius="md"
							variant="filled"
							style={{ background: "rgba(255,255,255,0.2)" }}
						>
							<IconScale size={20} color="white" />
						</ThemeIcon>
					</Group>
				</Paper>
			</SimpleGrid>

			{/* Transfer Summary */}
			{monthlyTransferSummary.count > 0 && (
				<Paper p="md" radius="md" withBorder mb="xl">
					<Group gap="xs" mb="sm">
						<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
							<IconTransfer size={14} />
						</ThemeIcon>
						<Text fw={600} size="sm">
							Transfer Bulan Ini
						</Text>
					</Group>
					<SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
						<Paper p="sm" radius="md" withBorder>
							<Text size="xs" c="dimmed">
								Total Ditransfer
							</Text>
							<Text size="lg" fw={700} c="blue">
								{formatCurrency(monthlyTransferSummary.totalTransferred)}
							</Text>
						</Paper>
						<Paper p="sm" radius="md" withBorder>
							<Text size="xs" c="dimmed">
								Biaya Transfer
							</Text>
							<Text size="lg" fw={700} c="orange">
								{formatCurrency(monthlyTransferSummary.totalFees)}
							</Text>
						</Paper>
						<Paper p="sm" radius="md" withBorder>
							<Text size="xs" c="dimmed">
								Jumlah Transfer
							</Text>
							<Text size="lg" fw={700}>
								{monthlyTransferSummary.count}x
							</Text>
						</Paper>
					</SimpleGrid>
				</Paper>
			)}

			{/* ===== CATEGORY BREAKDOWN ===== */}
			<Paper p="md" radius="md" withBorder mb="xl">
				{/* Section title */}
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size="md"
						radius="xl"
						variant="gradient"
						gradient={{ from: "blue", to: "cyan", deg: 135 }}
					>
						<IconCategory size={16} />
					</ThemeIcon>
					<div>
						<Title order={4} style={{ lineHeight: 1.2 }}>
							Pengeluaran & Pemasukan per Kategori
						</Title>
						<Text size="xs" c="dimmed">
							Perbandingan bulan ini dan minggu ini
						</Text>
					</div>
				</Group>

				{/* ── Bulan Ini ── */}
				<Group
					gap="xs"
					mb="sm"
					px="xs"
					py={6}
					style={{
						borderRadius: 8,
						background: "var(--mantine-color-blue-light)",
					}}
				>
					<ThemeIcon size="xs" radius="xl" variant="filled" color="blue">
						<IconChartBar size={10} />
					</ThemeIcon>
					<Text size="sm" fw={700} c="blue">
						Bulan Ini —{" "}
						{new Date().toLocaleString("id-ID", {
							month: "long",
							year: "numeric",
						})}
					</Text>
				</Group>

				<Grid gutter="md" mb="md">
					{/* Pengeluaran per Kategori — Bulan Ini */}
					<GridCol span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder h="100%">
							<Group gap="xs" mb="md">
								<ThemeIcon
									size="sm"
									radius="xl"
									variant="gradient"
									gradient={{ from: "red", to: "orange" }}
								>
									<IconTrendingDown size={14} />
								</ThemeIcon>
								<Title order={5}>Pengeluaran per Kategori</Title>
							</Group>

							{expenseCategoriesMonth.length === 0 ? (
								<Text c="dimmed" ta="center" py="lg" size="sm">
									Belum ada pengeluaran bulan ini
								</Text>
							) : (
								<Group align="flex-start" gap="lg">
									<RingProgress
										size={130}
										thickness={14}
										roundCaps
										sections={expenseCategoriesMonth.map((cat, idx) => ({
											value: cat.percentage,
											color: categoryColors[idx % categoryColors.length],
											tooltip: `${cat.categoryIcon} ${cat.categoryName}: ${cat.percentage.toFixed(1)}%`,
										}))}
										label={
											<Text ta="center" size="xs" fw={700}>
												{formatCurrency(totalExpenseCategories)}
											</Text>
										}
									/>
									<Stack gap={6} style={{ flex: 1 }}>
										{expenseCategoriesMonth.map((cat, idx) => (
											<Group
												key={cat.categoryId || idx}
												justify="space-between"
											>
												<Group gap="xs">
													<Box
														style={{
															width: 10,
															height: 10,
															borderRadius: "50%",
															backgroundColor:
																categoryColors[idx % categoryColors.length],
															flexShrink: 0,
														}}
													/>
													<Text size="sm">
														{cat.categoryIcon} {cat.categoryName}
													</Text>
												</Group>
												<div style={{ textAlign: "right" }}>
													<Text size="sm" fw={600} c="red">
														{formatCurrency(cat.total)}
													</Text>
													<Text size="xs" c="dimmed">
														{cat.percentage.toFixed(1)}% • {cat.count}x
													</Text>
												</div>
											</Group>
										))}
									</Stack>
								</Group>
							)}
						</Paper>
					</GridCol>

					{/* Pemasukan per Kategori — Bulan Ini */}
					<GridCol span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder h="100%">
							<Group gap="xs" mb="md">
								<ThemeIcon
									size="sm"
									radius="xl"
									variant="gradient"
									gradient={{ from: "teal", to: "lime" }}
								>
									<IconTrendingUp size={14} />
								</ThemeIcon>
								<Title order={5}>Pemasukan per Kategori</Title>
							</Group>

							{incomeCategoriesMonth.length === 0 ? (
								<Text c="dimmed" ta="center" py="lg" size="sm">
									Belum ada pemasukan bulan ini
								</Text>
							) : (
								<Group align="flex-start" gap="lg">
									<RingProgress
										size={130}
										thickness={14}
										roundCaps
										sections={incomeCategoriesMonth.map((cat, idx) => ({
											value: cat.percentage,
											color: categoryColors[idx % categoryColors.length],
											tooltip: `${cat.categoryIcon} ${cat.categoryName}: ${cat.percentage.toFixed(1)}%`,
										}))}
										label={
											<Text ta="center" size="xs" fw={700}>
												{formatCurrency(totalIncomeCategories)}
											</Text>
										}
									/>
									<Stack gap={6} style={{ flex: 1 }}>
										{incomeCategoriesMonth.map((cat, idx) => (
											<Group
												key={cat.categoryId || idx}
												justify="space-between"
											>
												<Group gap="xs">
													<Box
														style={{
															width: 10,
															height: 10,
															borderRadius: "50%",
															backgroundColor:
																categoryColors[idx % categoryColors.length],
															flexShrink: 0,
														}}
													/>
													<Text size="sm">
														{cat.categoryIcon} {cat.categoryName}
													</Text>
												</Group>
												<div style={{ textAlign: "right" }}>
													<Text size="sm" fw={600} c="green">
														{formatCurrency(cat.total)}
													</Text>
													<Text size="xs" c="dimmed">
														{cat.percentage.toFixed(1)}% • {cat.count}x
													</Text>
												</div>
											</Group>
										))}
									</Stack>
								</Group>
							)}
						</Paper>
					</GridCol>
				</Grid>

				<Divider my="md" />

				{/* ── Minggu Ini ── */}
				<Group
					gap="xs"
					mb="sm"
					px="xs"
					py={6}
					style={{
						borderRadius: 8,
						background: "var(--mantine-color-violet-light)",
					}}
				>
					<ThemeIcon size="xs" radius="xl" variant="filled" color="violet">
						<IconCalendarWeek size={10} />
					</ThemeIcon>
					<Text size="sm" fw={700} c="violet">
						Minggu Ini —{" "}
						{weekStart.toLocaleString("id-ID", {
							day: "numeric",
							month: "long",
						})}{" "}
						s/d{" "}
						{weekEnd.toLocaleString("id-ID", {
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</Text>
				</Group>

				<Grid gutter="md">
					<GridCol span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder h="100%">
							<Group gap="xs" mb="md">
								<ThemeIcon size="sm" radius="xl" variant="light" color="red">
									<IconCalendarWeek size={14} />
								</ThemeIcon>
								<Title order={5}>Pengeluaran per Kategori</Title>
							</Group>

							{expenseCategoriesWeek.length === 0 ? (
								<Text c="dimmed" ta="center" py="md" size="sm">
									Belum ada pengeluaran minggu ini
								</Text>
							) : (
								<Stack gap="xs">
									{expenseCategoriesWeek.map((cat, idx) => (
										<Box key={cat.categoryId || idx}>
											<Group justify="space-between" mb={4}>
												<Group gap="xs">
													<Text size="sm">
														{cat.categoryIcon} {cat.categoryName}
													</Text>
													<Badge size="xs" variant="light" color="gray">
														{cat.count}x
													</Badge>
												</Group>
												<Text size="sm" fw={600} c="red">
													{formatCurrency(cat.total)}
												</Text>
											</Group>
											<Progress
												value={cat.percentage}
												color={categoryColors[idx % categoryColors.length]
													.replace("var(--mantine-color-", "")
													.replace("-6)", "")}
												size="sm"
												radius="xl"
											/>
										</Box>
									))}
								</Stack>
							)}
						</Paper>
					</GridCol>

					<GridCol span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder h="100%">
							<Group gap="xs" mb="md">
								<ThemeIcon size="sm" radius="xl" variant="light" color="green">
									<IconCalendarWeek size={14} />
								</ThemeIcon>
								<Title order={5}>Pemasukan per Kategori</Title>
							</Group>

							{incomeCategoriesWeek.length === 0 ? (
								<Text c="dimmed" ta="center" py="md" size="sm">
									Belum ada pemasukan minggu ini
								</Text>
							) : (
								<Stack gap="xs">
									{incomeCategoriesWeek.map((cat, idx) => (
										<Box key={cat.categoryId || idx}>
											<Group justify="space-between" mb={4}>
												<Group gap="xs">
													<Text size="sm">
														{cat.categoryIcon} {cat.categoryName}
													</Text>
													<Badge size="xs" variant="light" color="gray">
														{cat.count}x
													</Badge>
												</Group>
												<Text size="sm" fw={600} c="green">
													{formatCurrency(cat.total)}
												</Text>
											</Group>
											<Progress
												value={cat.percentage}
												color={categoryColors[idx % categoryColors.length]
													.replace("var(--mantine-color-", "")
													.replace("-6)", "")}
												size="sm"
												radius="xl"
											/>
										</Box>
									))}
								</Stack>
							)}
						</Paper>
					</GridCol>
				</Grid>
			</Paper>

			{/* ===== BUDGET + DEBT ===== */}
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

			{/* ===== TOP TRANSACTIONS + RECENT ===== */}
			<Grid gutter="md" mb="xl">
				{/* Top Transaksi Bulan Ini */}
				<GridCol span={{ base: 12, md: 6 }}>
					<Paper p="md" radius="md" withBorder h="100%">
						<Group gap="xs" mb="md">
							<ThemeIcon size="sm" radius="xl" variant="light" color="orange">
								<IconFlame size={14} />
							</ThemeIcon>
							<Title order={4}>Transaksi Terbesar Bulan Ini</Title>
						</Group>

						{topExpensesMonth.length === 0 && topIncomeMonth.length === 0 ? (
							<Text c="dimmed" ta="center" py="md" size="sm">
								Belum ada transaksi bulan ini
							</Text>
						) : (
							<Stack gap="xs">
								{/* Top Pengeluaran */}
								{topExpensesMonth.length > 0 && (
									<>
										<Text size="xs" fw={600} c="dimmed" tt="uppercase">
											Pengeluaran
										</Text>
										{topExpensesMonth.slice(0, 3).map((txn, idx) => (
											<Group
												key={txn.id}
												justify="space-between"
												p="xs"
												style={{
													borderRadius: 8,
													background:
														idx === 0
															? "var(--mantine-color-red-light)"
															: "transparent",
												}}
											>
												<Group gap="xs">
													<Badge size="sm" variant="filled" color="red" circle>
														{idx + 1}
													</Badge>
													<div>
														<Text size="sm" fw={500}>
															{txn.description}
														</Text>
														<Text size="xs" c="dimmed">
															{txn.category?.icon} {txn.category?.name || "—"} •{" "}
															{dayjs(txn.date).format("DD MMM")}
														</Text>
													</div>
												</Group>
												<Text fw={700} c="red" size="sm">
													-{formatCurrency(parseFloat(txn.amount))}
												</Text>
											</Group>
										))}
									</>
								)}

								{topExpensesMonth.length > 0 && topIncomeMonth.length > 0 && (
									<Divider my={4} />
								)}

								{/* Top Pemasukan */}
								{topIncomeMonth.length > 0 && (
									<>
										<Text size="xs" fw={600} c="dimmed" tt="uppercase">
											Pemasukan
										</Text>
										{topIncomeMonth.slice(0, 3).map((txn, idx) => (
											<Group
												key={txn.id}
												justify="space-between"
												p="xs"
												style={{
													borderRadius: 8,
													background:
														idx === 0
															? "var(--mantine-color-green-light)"
															: "transparent",
												}}
											>
												<Group gap="xs">
													<Badge
														size="sm"
														variant="filled"
														color="green"
														circle
													>
														{idx + 1}
													</Badge>
													<div>
														<Text size="sm" fw={500}>
															{txn.description}
														</Text>
														<Text size="xs" c="dimmed">
															{txn.category?.icon} {txn.category?.name || "—"} •{" "}
															{dayjs(txn.date).format("DD MMM")}
														</Text>
													</div>
												</Group>
												<Text fw={700} c="green" size="sm">
													+{formatCurrency(parseFloat(txn.amount))}
												</Text>
											</Group>
										))}
									</>
								)}
							</Stack>
						)}
					</Paper>
				</GridCol>

				{/* Recent Transactions */}
				<GridCol span={{ base: 12, md: 6 }}>
					<Paper p="md" radius="md" withBorder h="100%">
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
							<TableScrollContainer minWidth={300}>
								<Table striped highlightOnHover>
									<TableThead>
										<TableTr>
											<TableTh>Transaksi</TableTh>
											<TableTh>Akun</TableTh>
											<TableTh ta="right">Nominal</TableTh>
										</TableTr>
									</TableThead>
									<TableTbody>
										{recentTransactions.map((txn) => (
											<TableTr key={txn.id}>
												<TableTd>
													<Stack gap={0}>
														<Text size="sm" fw={500}>
															{txn.description}
														</Text>
														<Text size="xs" c="dimmed">
															{dayjs(txn.date).format("DD MMM YYYY")}
														</Text>
													</Stack>
												</TableTd>
												<TableTd>
													<Badge variant="light" size="sm">
														{txn.account?.icon} {txn.account?.name}
													</Badge>
												</TableTd>
												<TableTd ta="right">
													<Text
														fw={600}
														c={txn.type === "INCOME" ? "green" : "red"}
														size="sm"
													>
														{txn.type === "INCOME" ? "+" : "-"}
														{formatCurrency(parseFloat(txn.amount))}
													</Text>
												</TableTd>
											</TableTr>
										))}
									</TableTbody>
								</Table>
							</TableScrollContainer>
						)}
					</Paper>
				</GridCol>
			</Grid>

			{/* ===== RECENT TRANSFERS ===== */}
			{recentTransfersList.length > 0 && (
				<Paper p="md" radius="md" withBorder mb="xl">
					<Group justify="space-between" mb="md">
						<Group gap="xs">
							<ThemeIcon size="sm" radius="xl" variant="light" color="blue">
								<IconTransfer size={14} />
							</ThemeIcon>
							<Title order={4}>Transfer Terakhir</Title>
						</Group>
						<Link
							href="/dashboard/transactions?type=TRANSFER"
							className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors font-medium"
						>
							Lihat semua
						</Link>
					</Group>

					<TableScrollContainer minWidth={400}>
						<Table striped highlightOnHover>
							<TableThead>
								<TableTr>
									<TableTh>Deskripsi</TableTh>
									<TableTh>Dari → Ke</TableTh>
									<TableTh ta="right">Nominal</TableTh>
								</TableTr>
							</TableThead>
							<TableTbody>
								{recentTransfersList.map((tf: any) => (
									<TableTr key={tf.id}>
										<TableTd>
											<Stack gap={0}>
												<Text size="sm" fw={500}>
													{tf.description}
												</Text>
												<Text size="xs" c="dimmed">
													{dayjs(tf.date).format("DD MMM YYYY")}
												</Text>
											</Stack>
										</TableTd>
										<TableTd>
											<Group gap={4} wrap="nowrap">
												<Badge variant="light" size="sm" color="red">
													{tf.fromAccount?.icon} {tf.fromAccount?.name}
												</Badge>
												<Text size="xs" c="dimmed">
													→
												</Text>
												<Badge variant="light" size="sm" color="green">
													{tf.toAccount?.icon} {tf.toAccount?.name}
												</Badge>
											</Group>
										</TableTd>
										<TableTd ta="right">
											<Text fw={600} c="blue" size="sm">
												{formatCurrency(parseFloat(tf.amount))}
											</Text>
											{parseFloat(tf.fee || "0") > 0 && (
												<Text size="xs" c="dimmed">
													Biaya: {formatCurrency(parseFloat(tf.fee))}
												</Text>
											)}
										</TableTd>
									</TableTr>
								))}
							</TableTbody>
						</Table>
					</TableScrollContainer>
				</Paper>
			)}
		</>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<CustomLoadingOverlay />}>
			<DashboardContent />
		</Suspense>
	);
}
