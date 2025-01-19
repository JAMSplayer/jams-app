import { z } from "zod";

export const editPlaylistSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters"),
    description: z
        .string()
        .max(100, "Description cannot exceed 100 characters")
        .optional(),
    picture: z.string().optional(),
});
