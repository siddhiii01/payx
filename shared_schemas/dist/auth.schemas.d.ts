import { z } from "zod";
export declare const authSchema: {
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
    register: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        number: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=auth.schemas.d.ts.map