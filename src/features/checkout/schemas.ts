import { z } from "zod";

/** Kero Mais — Validações do checkout (Zod + React Hook Form) */

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, { message: "Informe seu telefone" })
  .refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 11, {
    message: "Telefone inválido. Use DDD + número",
  });

export const zipSchema = z
  .string()
  .trim()
  .refine((v) => onlyDigits(v).length === 8, { message: "CEP inválido (8 dígitos)" });

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Informe seu nome completo" })
    .max(80, { message: "Nome muito longo" }),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(120, { message: "E-mail muito longo" })
    .email({ message: "E-mail inválido" })
    .optional()
    .or(z.literal("")),
});

export const addressSchema = z.object({
  zip: zipSchema,
  street: z.string().trim().min(3, { message: "Informe a rua" }).max(120),
  number: z.string().trim().min(1, { message: "Informe o número" }).max(12),
  complement: z.string().trim().max(60).optional().or(z.literal("")),
  district: z.string().trim().min(2, { message: "Informe o bairro" }).max(60),
  city: z.string().trim().min(2, { message: "Informe a cidade" }).max(60),
  state: z
    .string()
    .trim()
    .length(2, { message: "UF com 2 letras" })
    .transform((v) => v.toUpperCase()),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
});

export const paymentSchema = z
  .object({
    method: z.enum(["pix", "card_on_delivery", "cash", "online_card"], {
      errorMap: () => ({ message: "Selecione uma forma de pagamento" }),
    }),
    needsChange: z.boolean().default(false),
    changeFor: z.string().optional(),
    notes: z.string().trim().max(300, { message: "Máximo de 300 caracteres" }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "cash" && data.needsChange) {
      const value = Number(String(data.changeFor ?? "").replace(",", "."));
      if (!value || Number.isNaN(value) || value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["changeFor"],
          message: "Informe o valor do troco",
        });
      }
    }
  });

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_m, a, b, c) =>
      [a && `(${a}`, a.length === 2 ? ") " : "", b, c && `-${c}`].filter(Boolean).join(""),
    );
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ""}`);
}

export function maskZip(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
