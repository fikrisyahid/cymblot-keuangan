import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import { Button } from "@mantine/core";
import { revalidatePath } from "next/cache";

export default async function Page() {
  const user = await currentUser();

  const handleRefresh = async () => {
    "use server";
    revalidatePath("/dashboard");
  };

  const keuanganUser = await prisma.transaksi.findMany({
    where: {
      user: {
        email: user?.emailAddresses[0].emailAddress,
      },
    },
  });

  const result = {
    ...keuanganUser,
    currentStringDate: new Date().toISOString(),
  };

  return (
    <div>
      {JSON.stringify(result)}
      <form action={handleRefresh}>
        <Button type="submit">Refresh</Button>
      </form>
    </div>
  );
}
