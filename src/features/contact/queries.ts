import { MessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getMessages(status?: MessageStatus) {
  return prisma.contactMessage.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getMessageCounts() {
  const grouped = await prisma.contactMessage.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const counts: Record<string, number> = {};
  let total = 0;
  for (const g of grouped) {
    counts[g.status] = g._count.status;
    total += g._count.status;
  }
  return { counts, total };
}
