import { z } from "zod";

// Schema de UI (lo que valida el formulario en cliente).
export const contactSchema = z.object({
  name: z.string().min(2, "Dime tu nombre").max(100),
  email: z.string().email("Ese email no parece válido"),
  message: z.string().min(10, "Cuéntame un poco más (mín. 10 caracteres)").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

// Schema del servidor (añade contexto + honeypot anti-spam).
export const contactBodySchema = contactSchema.extend({
  sourcePage: z.string().max(256).optional(),
  company: z.string().optional(), // honeypot: si viene relleno, es un bot
});
