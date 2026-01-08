import { z } from "zod";

const updateFacebookPixelSchemaZod = z.object({
    body: z.object({
        pixelId: z.string().optional(),
        accessToken: z.string().optional(),
    }).refine(data => data.pixelId || data.accessToken, {
        message: "Either pixelId or accessToken must be provided"
    })
});

export const FacebookPixelValidation = {
    updateFacebookPixelSchemaZod
}
