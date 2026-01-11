import z from "zod";
export declare const moneySchema: z.ZodObject<{
    amount: z.ZodNumber;
    provider: z.ZodEnum<{
        HDFC: "HDFC";
        AXIS: "AXIS";
        SBI: "SBI";
    }>;
}, z.core.$strip>;
export type Money = z.infer<typeof moneySchema>;
//# sourceMappingURL=wallet.schemas.d.ts.map