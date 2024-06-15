"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import revalidateAllRoute from "./revalidate-all-route";

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

      revalidateAllRoute();
    }
  }
}

export async function editSumber({ id, nama }: { id: string; nama: string }) {
  await prisma.sumber.update({
    where: { id },
    data: { nama },
  });

  revalidateAllRoute();
}

export async function deleteSumber({ id }: { id: string }) {
  await prisma.sumber.delete({
    where: { id },
  });

  revalidateAllRoute();
}
