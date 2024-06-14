"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../db/init";

export async function addSumber({
  formData,
  pathToRevalidate,
}: {
  formData: FormData;
  pathToRevalidate: string;
}) {
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

      revalidatePath(pathToRevalidate);
    }
  }
}

export async function editSumber({
  id,
  nama,
  pathToRevalidate,
}: {
  id: string;
  nama: string;
  pathToRevalidate: string;
}) {
  await prisma.sumber.update({
    where: { id },
    data: { nama },
  });

  revalidatePath(pathToRevalidate);
}

export async function deleteSumber({
  id,
  pathToRevalidate,
}: {
  id: string;
  pathToRevalidate: string;
}) {
  await prisma.sumber.delete({
    where: { id },
  });

  revalidatePath(pathToRevalidate);
}
