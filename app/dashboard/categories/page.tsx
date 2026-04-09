import { Suspense } from "react";
import { getCategories } from "@/app/actions/categories";
import { CategoriesClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function CategoriesContent() {
	const categories = await getCategories();

	return <CategoriesClient categories={categories} />;
}

export default function CategoriesPage() {
	return (
		<Suspense fallback={<CustomLoadingOverlay />}>
			<CategoriesContent />
		</Suspense>
	);
}
