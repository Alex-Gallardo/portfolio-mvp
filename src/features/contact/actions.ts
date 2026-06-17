"use server";

import { revalidatePath } from "next/cache";
import { MessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/auth";

const VALID = new Set<string>(Object.values(MessageStatus));

export async function setMessageStatus(formData: FormData) {
  if (!(await isStaff())) throw new Error("No autorizado");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !VALID.has(status)) throw new Error("Datos inválidos");

  await prisma.contactMessage.update({
    where: { id },
    data: { status: status as MessageStatus },
  });
  revalidatePath("/admin/mensajes");
}
