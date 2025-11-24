import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid Email Format"),
    password: z.string().min(1, "Password is required")
})