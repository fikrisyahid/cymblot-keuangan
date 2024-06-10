import prisma from "@/app/db/init";
import { User } from "@clerk/nextjs/server";
import { Text } from "@mantine/core";
import AddSumberForm from "./add-sumber-form";
import TableSumber from "./table-sumber";

export default async function TujuanSection({ user }: { user: User }) {
  const daftarSumber = await prisma.sumber.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  return (
    <>
      <Text fw={700}>Daftar Tujuan</Text>
      <AddSumberForm />
      <TableSumber daftarSumber={daftarSumber} />
    </>
  );
}
