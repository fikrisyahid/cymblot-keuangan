import { getPocket } from '@/app/actions/db/pocket';
import { Pocket } from '@prisma/client';
import AddPocketPopup from '@/app/components/functions/add-pocket-popup';
import PocketTableClient from './client';

export default async function PocketTable({ email }: { email: string }) {
  const pockets = (await getPocket({ email, withBalance: true })) as Pocket[];

  const pocketsForTable = pockets.map((pocket, index) => ({
    no: index + 1,
    ...pocket,
  }));

  return (
    <>
      <AddPocketPopup pockets={pockets} email={email} className="sm:self-end" />
      <PocketTableClient pockets={pocketsForTable} />
    </>
  );
}
