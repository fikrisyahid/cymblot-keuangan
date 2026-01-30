import { getAccounts } from "@/app/actions/accounts";
import { AccountsClient } from "./client";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return <AccountsClient accounts={accounts} />;
}
