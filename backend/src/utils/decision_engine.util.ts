import { prisma } from "@db/prisma.js"
import { AppError } from "./AppError.js";

export const evaluteIntent = async (intentId:number) => {
    const intent = await prisma.transactionIntent.findUnique({
        where: {id: intentId}
    });

    if(!intent){
        throw new AppError("Transaction intent not found", 400);
    }

    let decision: "APPROVED" | "BLOCKED";
    let reason: string;

    if (intent.amount > 1000) {
    decision = "BLOCKED";
    reason = "Amount exceeds single-transaction limit";
  } else {
        decision = "APPROVED";
        reason = "Amount within allowed limit";
  }

   await prisma.transactionDecision.create({
    data: {
      intentId: intent.id,
      decision,
      reason
    }
  });

  return { decision, reason };
}