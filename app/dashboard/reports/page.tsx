import { Suspense } from "react";
import { getReportData, getWeeksInMonth } from "@/app/actions/reports";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";
import type { PeriodType } from "@/app/actions/reports";
import { ReportsClient } from "./client";

interface ReportsPageProps {
	searchParams: Promise<{
		period?: string;
		year?: string;
		month?: string;
		week?: string;
	}>;
}

async function ReportsContent({ searchParams }: ReportsPageProps) {
	const params = await searchParams;

	const now = new Date();
	const period = (params.period as PeriodType) || "monthly";
	const year = params.year ? parseInt(params.year) : now.getFullYear();
	const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
	const week = params.week ? parseInt(params.week) : 1;

	const [reportData, weeks] = await Promise.all([
		getReportData(period, year, month, week),
		getWeeksInMonth(year, month),
	]);

	return (
		<ReportsClient
			data={reportData}
			period={period}
			year={year}
			month={month}
			week={week}
			weeks={weeks}
		/>
	);
}

export default function ReportsPage(props: ReportsPageProps) {
	return (
		<Suspense fallback={<CustomLoadingOverlay />}>
			<ReportsContent {...props} />
		</Suspense>
	);
}
