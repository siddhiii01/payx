"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().min(1, "Email is required").email({ message: "Invalid Email format" }),
    password: zod_1.z.string().min(1, "Password is required")
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().trim().min(1, "Email is required").email({ message: "Invalid email format" }),
    password: zod_1.z.string(),
    phoneNumber: zod_1.z.string().length(10, "Phone number must be 10 digits")
});
//Zod Does 2 thing at run time
// -> 1. Validation
// -> 2. Runtime Safety
//# sourceMappingURL=auth.schemas.js.map