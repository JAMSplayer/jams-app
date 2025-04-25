import { z } from "zod";

export const createPlaylistSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters"),
    description: z
        .string()
        .max(100, "Description cannot exceed 100 characters")
        .optional(),
    picture: z.string().optional(),
    tags: z
        .array(z.string().min(1).max(20))
        .max(5, "You can add up to 5 tags")
        .optional(),
});
