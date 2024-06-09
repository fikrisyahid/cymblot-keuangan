import prisma from "@/app/db/init";
import { User, currentUser } from "@clerk/nextjs/server";
import { Text } from "@mantine/core";
import { revalidatePath } from "next/cache";
import AddSumberForm from "./add-sumber-form";
import TableSumber from "./table-sumber";

export default async function TujuanSection({ user }: { user: User }) {
  const daftarSumber = await prisma.sumber.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  async function addSumber(formData: FormData) {
    "use server";

    const user = await currentUser();
    if (user) {
      const { emailAddress: email } = user.emailAddresses[0];
      const nama = formData.get("sumber")?.toString();

      if (nama) {
        await prisma.sumber.create({
          data: {
            email,
            nama,
          },
        });

        revalidatePath("/detail/sumber-tujuan");
      }
    }
  }

  async function deleteSumber(id: string) {
    "use server";

    await prisma.sumber.delete({
      where: { id },
    });

    revalidatePath("/detail/sumber-tujuan");
  }

  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <AddSumberForm addSumber={addSumber} />
      <TableSumber daftarSumber={daftarSumber} deleteSumber={deleteSumber} />
    </>
  );
}
