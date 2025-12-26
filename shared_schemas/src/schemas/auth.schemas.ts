import {z} from "zod";

export const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email({message: "Invalid Email format"}),
    password: z.string().min(1, "Password is required")

});

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().trim().min(1, "Email is required").email({ message: "Invalid email format" }),
    password: z.string(),
    phoneNumber: z.string().length(10, "Phone number must be 10 digits")
});

export type LoginCredentials = z.infer<typeof loginSchema>
export type SignupCredentials = z.infer<typeof registerSchema>

//Zod Does 2 thing at run time
// -> 1. Validation
// -> 2. Runtime Safety