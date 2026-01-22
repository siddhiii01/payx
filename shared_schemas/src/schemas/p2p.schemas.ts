import z from "zod";

export const paymentSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be at least Rs. 1")
    .max(10_000, "You can send a maximum of Rs. 10,000 at once"),

  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),
});

export type Payment = z.infer<typeof paymentSchema>;
