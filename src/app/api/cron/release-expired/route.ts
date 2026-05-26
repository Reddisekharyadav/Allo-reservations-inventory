import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret")?.trim();
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!secret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
    });

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT * FROM inventory WHERE "productId" = ${reservation.productId} AND "warehouseId" = ${reservation.warehouseId} FOR UPDATE
        `;

        const inventory = rows[0];

        if (!inventory) return;

        await tx.inventory.update({ where: { id: inventory.id }, data: { reservedStock: { decrement: reservation.quantity } } });

        await tx.reservation.update({ where: { id: reservation.id }, data: { status: "EXPIRED" } });
      });
    }

    return NextResponse.json({ success: true, releasedReservations: expiredReservations.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to release expired reservations" }, { status: 500 });
  }
}
