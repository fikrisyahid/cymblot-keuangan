"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import { revalidatePath } from "next/cache";

export async function addTujuan(formData: FormData) {
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

export async function editTujuan({ id, nama }: { id: string; nama: string }) {
  await prisma.tujuan.update({
    where: { id },
    data: { nama },
  });

  revalidatePath("/detail/sumber-tujuan");
}

export async function deleteTujuan(id: string) {
  await prisma.tujuan.delete({
    where: { id },
  });

  revalidatePath("/detail/sumber-tujuan");
}
