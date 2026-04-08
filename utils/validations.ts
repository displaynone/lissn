import { z } from "zod";

export const isValidUrl = z
	.string()
	.max(120, "Too long")
	.regex(
		/^((https?|content):\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
		"Not valid URL"
	)
	.optional()
	.or(z.literal(""));
