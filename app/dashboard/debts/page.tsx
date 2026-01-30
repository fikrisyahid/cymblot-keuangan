import { getDebts } from "@/app/actions/debts";
import { DebtsClient } from "./client";

export default async function DebtsPage() {
  const debts = await getDebts();

  return <DebtsClient debts={debts} />;
}
