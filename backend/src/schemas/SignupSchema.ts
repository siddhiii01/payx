import * as z from "zod";

export const SignupSchema = z.object({
    name: z.string().min(2, "Name should have atleast 2 characters"),
    email: z.string().email("Invalid Email Format"),
    password: z.string()
            .min(8, "Minimum 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[a-z]/, "Must contain at least one lowercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(/[@$!%*?&]/, "Must contain at least one special character")
        
});