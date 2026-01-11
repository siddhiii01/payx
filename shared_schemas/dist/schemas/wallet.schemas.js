"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneySchema = void 0;
const zod_1 = __importDefault(require("zod"));
const PROVIDERS = ["HDFC", "AXIS", "SBI"];
exports.moneySchema = zod_1.default.object({
    amount: zod_1.default.number()
        .min(1, "Amount must be at least Rs.1")
        .max(20000, "Amount cannot exceed 20,000rs."),
    provider: zod_1.default.enum(PROVIDERS),
});
//# sourceMappingURL=wallet.schemas.js.map