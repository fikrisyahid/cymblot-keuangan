import { Suspense } from "react";
import { getAccounts } from "@/app/actions/accounts";
import { AccountsClient } from "./client";
import CustomLoadingOverlay from "@/components/custom-loading-overlay";

async function AccountsContent() {
  const accounts = await getAccounts();

  return <AccountsClient accounts={accounts} />;
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<CustomLoadingOverlay />}>
      <AccountsContent />
    </Suspense>
  );
}
