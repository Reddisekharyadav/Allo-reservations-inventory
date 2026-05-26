import { Prisma } from "@prisma/client";
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
      select: {
        id: true,
        productId: true,
        warehouseId: true,
        quantity: true,
      },
    });

    const releasedReservations = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let released = 0;

      for (const reservation of expiredReservations) {
        const expired = await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: "PENDING",
            expiresAt: { lt: new Date() },
          },
          data: { status: "EXPIRED" },
        });

        if (expired.count === 0) continue;

        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: { reservedStock: { decrement: reservation.quantity } },
        });

        released += 1;
      }

      return released;
    });

    return NextResponse.json({ success: true, releasedReservations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to release expired reservations" }, { status: 500 });
  }
}
