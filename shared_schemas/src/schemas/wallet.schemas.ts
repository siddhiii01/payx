import z from "zod";

const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

export const moneySchema = z.object({
    amount : z.number()
            .min(1, "Amount must be at least Rs.1")
            .max(20000, "Amount cannot exceed 20,000rs."),
    provider: z.enum(PROVIDERS),
});

export type Money = z.infer<typeof moneySchema>;