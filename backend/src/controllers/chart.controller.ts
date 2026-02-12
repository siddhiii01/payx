// src/controllers/chart.controller.ts
import { prisma } from "@db/prisma.js";
import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { subDays, startOfDay } from "date-fns";

export class ChartController {
  static getTransactionVolume = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) throw new AppError("Unauthorized", 401);

    // Parse days safely
    const daysQuery = req.query.days;
    const daysStr = typeof daysQuery === "string" ? daysQuery : "7";
    const days = Number(daysStr);

    // Validate input
    if (isNaN(days) || (days !== 7 && days !== 30 && days !== 90)) {
      throw new AppError("Invalid days parameter. Use 7, 30, or 90", 400);
    }

    const startDate = startOfDay(subDays(new Date(), days - 1));

    // Fetch ledger entries in the date range
    const ledgerEntries = await prisma.transactionLedger.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        direction: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day (Money In = CREDIT, Money Out = DEBIT)
    const dailyData = new Map<string, { in: number; out: number }>();

    ledgerEntries.forEach((entry) => {
      // Get YYYY-MM-DD string safely
      const dateKey = startOfDay(entry.createdAt).toISOString().split("T")[0];

      // Get or initialize the day's data
      let dayTotals = dailyData.get(dateKey);
      if (!dayTotals) {
        dayTotals = { in: 0, out: 0 };
        dailyData.set(dateKey, dayTotals);
      }

      // Add amount (convert paise to rupees)
      if (entry.direction === "CREDIT") {
        dayTotals.in += entry.amount / 100;
      } else {
        dayTotals.out += entry.amount / 100;
      }
    });

    // Generate labels and data arrays (fill missing days with 0)
    const labels: string[] = [];
    const moneyIn: number[] = [];
    const moneyOut: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateKey = date.toISOString().split("T")[0];

      labels.push(date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }));

      const dayTotals = dailyData.get(dateKey) || { in: 0, out: 0 };
      moneyIn.push(dayTotals.in);
      moneyOut.push(dayTotals.out);
    }

    // Send response
    return res.status(200).json({
      success: true,
      data: {
        labels,
        moneyIn,
        moneyOut,
      },
    });
  });
}