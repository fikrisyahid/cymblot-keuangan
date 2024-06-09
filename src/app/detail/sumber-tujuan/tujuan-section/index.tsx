import prisma from "@/app/db/init";
import { User, currentUser } from "@clerk/nextjs/server";
import { Text } from "@mantine/core";
import { revalidatePath } from "next/cache";
import AddTujuanForm from "./add-tujuan-form";
import TableTujuan from "./table-tujuan";

export default async function TujuanSection({ user }: { user: User }) {
  const daftarTujuan = await prisma.tujuan.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  async function addTujuan(formData: FormData) {
    "use server";

    const user = await currentUser();
    if (user) {
      const { emailAddress: email } = user.emailAddresses[0];
      const nama = formData.get("tujuan")?.toString();

      if (nama) {
        await prisma.tujuan.create({
          data: {
            email,
            nama,
          },
        });

        revalidatePath("/detail/sumber-tujuan");
      }
    }
  }

  async function deleteTujuan(id: string) {
    "use server";

    await prisma.tujuan.delete({
      where: { id },
    });

    revalidatePath("/detail/sumber-tujuan");
  }

  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <AddTujuanForm addTujuan={addTujuan} />
      <TableTujuan daftarTujuan={daftarTujuan} deleteTujuan={deleteTujuan} />
    </>
  );
}
