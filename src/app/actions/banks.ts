"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import { revalidatePath } from "next/cache";

export async function addBank({ formData }: { formData: FormData }) {
  const user = await currentUser();
  if (user) {
    const { emailAddress: email } = user.emailAddresses[0];
    const nama = formData.get("bank")?.toString();

    if (nama) {
      await prisma.banks.create({
        data: {
          email,
          nama,
        },
      });

      revalidatePath("/detail");
      revalidatePath("/bank");
      revalidatePath("/dashboard");
    }
  }
}

export async function editBank({ id, nama }: { id: string; nama: string }) {
  await prisma.banks.update({
    where: { id },
    data: { nama },
  });

  revalidatePath("/detail");
  revalidatePath("/bank");
  revalidatePath("/dashboard");
}

export async function deleteBank({ id }: { id: string }) {
  await prisma.banks.delete({
    where: { id },
  });

  revalidatePath("/detail");
  revalidatePath("/bank");
  revalidatePath("/dashboard");
}
