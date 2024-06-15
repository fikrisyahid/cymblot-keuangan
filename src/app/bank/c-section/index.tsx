import AddForm from "./add-form";
import TableSection from "./table-section";
import { IBanks } from "@/types/db";
import { addBank, deleteBank, editBank } from "@/app/actions/banks";

export default async function Section({ userBanks }: { userBanks: IBanks[] }) {
  return (
    <>
      <AddForm addFunction={addBank} />
      <TableSection
        data={userBanks}
        deleteFunction={deleteBank}
        editFunction={editBank}
      />
    </>
  );
}
