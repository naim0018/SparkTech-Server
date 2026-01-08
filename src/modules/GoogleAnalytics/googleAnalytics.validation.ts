import { z } from "zod";

const updateGoogleAnalyticsSchemaZod = z.object({
    body: z.object({
        id: z.string({
            required_error: "Google Analytics ID is required"
        }),
    })
});

export const GoogleAnalyticsValidation = {
    updateGoogleAnalyticsSchemaZod
}
