import { z } from "zod";

export const env = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof env>;
