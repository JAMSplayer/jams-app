import { z } from "zod";
import i18n from "i18next";

export const singleFileUploadSchema = z.object({
    title: z
        .string()
        .min(1, i18n.t("titleIsRequired"))
        .max(100, i18n.t("titleCannotExceed100Characters")),
    artist: z
        .string()
        .min(1, i18n.t("artistIsRequired"))
        .max(100, i18n.t("artistCannotExceed100Characters")),
    album: z
        .string()
        .max(100, i18n.t("albumCannotExceed100Characters"))
        .optional(),
    genre: z
        .string()
        .max(30, i18n.t("genreCannotExceed30Characters"))
        .optional(),
    year: z
        .number()
        .optional()
        .refine(
            (value) =>
                value === null ||
                value === undefined ||
                (value >= 1000 && value <= 9999),
            {
                message: i18n.t("yearMustBeA4DigitNumberIfProvided"),
            }
        ),
    trackNumber: z
        .number()
        .optional()
        .refine(
            (value) =>
                value === null ||
                value === undefined ||
                (value >= 0 && value <= 999),
            {
                message: i18n.t("trackNumberMustBeANumericValueIfProvided"),
            }
        ),
    duration: z.number().optional(),
    channels: z.number().optional(),
    sampleRate: z.number().optional(),
    picture: z.string().optional(),
});
