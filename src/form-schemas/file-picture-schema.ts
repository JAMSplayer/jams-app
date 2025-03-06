import { z } from "zod";

// not currently used
export const filePictureSchema = z.object({
    data: z.instanceof(Uint8Array),
    mime_type: z.string(),
});
