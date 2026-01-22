"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.paymentSchema = zod_1.default.object({
    amount: zod_1.default
        .number()
        .min(1, "Amount must be at least Rs. 1")
        .max(10_000, "You can send a maximum of Rs. 10,000 at once"),
    phoneNumber: zod_1.default
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),
});
//# sourceMappingURL=p2p.schemas.js.map