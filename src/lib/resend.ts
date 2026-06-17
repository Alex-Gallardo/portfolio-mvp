import { Resend } from "resend";

// Si no hay API key (p. ej. en local), queda null y el envío se omite sin romper.
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
