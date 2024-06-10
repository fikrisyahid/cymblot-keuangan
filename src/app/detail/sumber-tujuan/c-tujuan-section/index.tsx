import prisma from "@/app/db/init";
import { User } from "@clerk/nextjs/server";
import { Text } from "@mantine/core";
import AddTujuanForm from "./add-tujuan-form";
import TableTujuan from "./table-tujuan";

export default async function TujuanSection({ user }: { user: User }) {
  const daftarTujuan = await prisma.tujuan.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <AddTujuanForm />
      <TableTujuan daftarTujuan={daftarTujuan} />
    </>
  );
}
