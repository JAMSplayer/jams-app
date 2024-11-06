import { z } from "zod";

export const createAccountSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .max(64),
    password: z
        .string()
        .min(8, {
            message: "Password must be at least 8 characters.",
        })
        .max(64),
    confirmPassword: z
        .string()
        .min(8, {
            message: "Confirm Password must be at least 8 characters.",
        })
        .max(64, {
            message: "Confirm Password cannot exceed 64 characters.",
        }),
});
