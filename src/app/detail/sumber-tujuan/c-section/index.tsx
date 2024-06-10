import { Text } from "@mantine/core";
import AddForm from "./add-form";
import { addTujuan, deleteTujuan } from "@/app/actions/tujuan";
import { addSumber, deleteSumber } from "@/app/actions/sumber";
import TableSection from "./table-section";
import { ITujuanSumber } from "@/types/db";

export default async function Section({
  type,
  data,
}: {
  type: "sumber" | "tujuan";
  data: ITujuanSumber[];
}) {
  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <AddForm
        addFunction={type === "sumber" ? addSumber : addTujuan}
        type={type}
      />
      <TableSection
        type={type}
        data={data}
        deleteFunction={type === "sumber" ? deleteSumber : deleteTujuan}
      />
    </>
  );
}
