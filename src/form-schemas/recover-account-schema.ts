import { z } from "zod";

export const recoverAccountSchema = z
    .object({
        secretKey: z
            .string()
            .min(2, {
                message: "Secret key must be at least 2 characters.",
            })
            .max(64),
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
                message: "Password must be at least 8 characters.",
            })
            .max(64, {
                message: "Password cannot exceed 64 characters.",
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match.",
        path: ["confirmPassword"], // Attach error to confirmPassword field
    });
