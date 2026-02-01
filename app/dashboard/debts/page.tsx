import { Suspense } from "react";
import { getDebts } from "@/app/actions/debts";
import { DebtsClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function DebtsContent() {
  const debts = await getDebts();

  return <DebtsClient debts={debts} />;
}

export default function DebtsPage() {
  return (
    <Suspense fallback={<CustomLoadingOverlay />}>
      <DebtsContent />
    </Suspense>
  );
}
