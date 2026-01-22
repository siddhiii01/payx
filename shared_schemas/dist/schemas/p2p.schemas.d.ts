import z from "zod";
export declare const paymentSchema: z.ZodObject<{
    amount: z.ZodNumber;
    phoneNumber: z.ZodString;
}, z.core.$strip>;
export type Payment = z.infer<typeof paymentSchema>;
//# sourceMappingURL=p2p.schemas.d.ts.map