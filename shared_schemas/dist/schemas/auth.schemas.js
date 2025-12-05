"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchema = void 0;
const zod_1 = require("zod");
const login = zod_1.z.object({
    email: zod_1.z.string().trim().min(1, "Email is required").email({ message: "Invalid Email format" }),
    password: zod_1.z.string().min(1, "Password is required")
});
const register = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().trim().min(1, "Email is required").email({ message: "Invalid email format" }),
    password: zod_1.z.string(),
    number: zod_1.z.string()
});
exports.authSchema = {
    login,
    register
};
//# sourceMappingURL=auth.schemas.js.map