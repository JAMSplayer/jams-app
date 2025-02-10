import { t } from "i18next";
import { z } from "zod";

export const singleFileUploadSchema = z.object({
    title: z
        .string()
        .min(1, t("titleIsRequired"))
        .max(100, t("titleCannotExceed100Characters")),
    artist: z
        .string()
        .min(1, t("artistIsRequired"))
        .max(100, t("artistCannotExceed100Characters")),
    album: z.string().max(100, t("albumCannotExceed100Characters")).optional(),
    genre: z.string().max(30, t("genreCannotExceed30Characters")).optional(),
    year: z
        .number()
        .optional()
        .refine(
            (value) =>
                value === null ||
                value === undefined ||
                (value >= 1000 && value <= 9999),
            {
                message: t("yearMustBeA4DigitNumberIfProvided"),
            }
        ),
    trackNumber: z
        .preprocess((val) => {
            const parsed = typeof val === "string" ? parseInt(val, 10) : val;
            return isNaN(parsed as number) ? undefined : (parsed as number); // Type assertion to number
        }, z.union([z.number(), z.undefined()])) // Allow both number and undefined
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && value <= 999),
            {
                message: t("trackNumberMustBeANumericValueIfProvided"),
            }
        ),
    duration: z.number().optional(),
    channels: z.number().optional(),
    sampleRate: z.number().optional(),
    picture: z.string().optional(),
    tags: z
        .array(z.string().min(1).max(20))
        .max(5, "You can add up to 5 tags")
        .optional(),
});
