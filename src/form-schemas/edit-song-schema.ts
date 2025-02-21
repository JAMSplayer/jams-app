import { t } from "i18next";
import { z } from "zod";

export const editSongSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Title is required",
        })
        .max(100, "Title cannot exceed 100 characters"),
    artist: z
        .string()
        .max(100, "Artist cannot exceed 100 characters")
        .optional(),
    picture: z.string().optional(),
    album: z.any().optional(),
    genre: z.any().optional(),
    year: z.any().optional(),
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
    tags: z
        .array(z.string().min(1).max(20))
        .max(5, "You can add up to 5 tags")
        .optional(),
});
