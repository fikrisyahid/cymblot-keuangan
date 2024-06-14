"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../db/init";

export async function addSumber({ formData }: { formData: FormData }) {
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

      revalidatePath("/detail");
      revalidatePath("/detail/sumber-tujuan");
    }
  }
}

export async function editSumber({ id, nama }: { id: string; nama: string }) {
  await prisma.sumber.update({
    where: { id },
    data: { nama },
  });

  revalidatePath("/detail");
  revalidatePath("/detail/sumber-tujuan");
}

export async function deleteSumber({ id }: { id: string }) {
  await prisma.sumber.delete({
    where: { id },
  });

  revalidatePath("/detail");
  revalidatePath("/detail/sumber-tujuan");
}
