import { Text } from "@mantine/core";
import AddForm from "./add-form";
import { addTujuan, deleteTujuan, editTujuan } from "@/app/actions/tujuan";
import { addSumber, deleteSumber, editSumber } from "@/app/actions/sumber";
import TableSection from "./table-section";
import { ITujuanSumber } from "@/types/db";
import stringCapitalize from "@/utils/string-capitalize";

export default async function Section({
  type,
  data,
}: {
  type: "sumber" | "tujuan";
  data: ITujuanSumber[];
}) {
  return (
    <>
      <Text fw={700}>Daftar {stringCapitalize(type)}</Text>
      <AddForm
        addFunction={type === "sumber" ? addSumber : addTujuan}
        type={type}
        data={data}
      />
      <TableSection
        type={type}
        data={data}
        deleteFunction={type === "sumber" ? deleteSumber : deleteTujuan}
        editFunction={type === "sumber" ? editSumber : editTujuan}
      />
    </>
  );
}
