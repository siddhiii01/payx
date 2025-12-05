import {z} from "zod";

const login = z.object({
    email: z.string().trim().min(1, "Email is required").email({message: "Invalid Email format"}),
    password: z.string().min(1, "Password is required")

});

const register = z.object({
    name: z.string(),
    email: z.string().trim().min(1, "Email is required").email({ message: "Invalid email format" }),
    password: z.string(),
    number: z.string()
});

export const  authSchema = {
    login,
    register
}