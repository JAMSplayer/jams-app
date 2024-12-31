import { z } from "zod";
import i18n from "i18next";

export const recoverAccountSchema = z
    .object({
        secretKey: z
            .string()
            .min(2, {
                message: i18n.t("secretKeyMustBeAtLeastCharacters", {
                    count: 2,
                }),
            })
            .max(64, {
                message: i18n.t("secretKeyCannotExceedCharacters", {
                    count: 64,
                }),
            }),
        username: z
            .string()
            .min(2, {
                message: i18n.t("usernameMustBeAtLeastCharacters", {
                    count: 2,
                }),
            })
            .max(64, {
                message: i18n.t("usernameCannotExceedCharacters", {
                    count: 64,
                }),
            }),
        password: z
            .string()
            .min(8, {
                message: i18n.t("passwordMustBeAtLeastCharacters", {
                    count: 8,
                }),
            })
            .max(64, {
                message: i18n.t("passwordCannotExceedCharacters", {
                    count: 64,
                }),
            }),
        confirmPassword: z
            .string()
            .min(8, {
                message: i18n.t("passwordMustBeAtLeastCharacters", {
                    count: 8,
                }),
            })
            .max(64, {
                message: i18n.t("passwordCannotExceedCharacters", {
                    count: 64,
                }),
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: i18n.t("passwordsMustMatch"),
        path: ["confirmPassword"], // Attach error to confirmPassword field
    });
