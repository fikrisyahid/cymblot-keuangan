"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import { revalidatePath } from "next/cache";

export async function addTujuan({
  formData,
  pathToRevalidate,
}: {
  formData: FormData;
  pathToRevalidate: string;
}) {
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

      revalidatePath(pathToRevalidate);
    }
  }
}

export async function editTujuan({
  id,
  nama,
  pathToRevalidate,
}: {
  id: string;
  nama: string;
  pathToRevalidate: string;
}) {
  await prisma.tujuan.update({
    where: { id },
    data: { nama },
  });

  revalidatePath(pathToRevalidate);
}

export async function deleteTujuan({
  id,
  pathToRevalidate,
}: {
  id: string;
  pathToRevalidate: string;
}) {
  await prisma.tujuan.delete({
    where: { id },
  });

  revalidatePath(pathToRevalidate);
}
