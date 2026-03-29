import { z } from "zod";

export const contactEmailSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
});
