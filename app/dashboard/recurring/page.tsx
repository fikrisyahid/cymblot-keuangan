import { Suspense } from "react";
import { getRecurringTransactions } from "@/app/actions/recurring";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { RecurringClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function RecurringContent() {
	const [recurringTransactions, accounts, categories] = await Promise.all([
		getRecurringTransactions(),
		getAccounts(),
		getCategories(),
	]);

	return (
		<RecurringClient
			recurringTransactions={recurringTransactions}
			accounts={accounts}
			categories={categories}
		/>
	);
}

export default function RecurringPage() {
	return (
		<Suspense fallback={<CustomLoadingOverlay />}>
			<RecurringContent />
		</Suspense>
	);
}
