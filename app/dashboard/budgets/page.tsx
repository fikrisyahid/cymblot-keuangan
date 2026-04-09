import { Suspense } from "react";
import { getBudgetsWithSpending } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/categories";
import { BudgetsClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function BudgetsContent() {
	const [budgets, categories] = await Promise.all([
		getBudgetsWithSpending(),
		getCategories(),
	]);

	return <BudgetsClient budgets={budgets} categories={categories} />;
}

export default function BudgetsPage() {
	return (
		<Suspense fallback={<CustomLoadingOverlay />}>
			<BudgetsContent />
		</Suspense>
	);
}
