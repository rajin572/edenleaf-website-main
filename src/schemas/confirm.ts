import z from "zod";

export const confirmReasonSchema = (label = "Reason", required = true) =>
    z.object({
        reason: required
            ? z.string().min(1, `${label} is required`)
            : z.string().default(""),
    });

export type ConfirmReasonFormValues = z.infer<ReturnType<typeof confirmReasonSchema>>;
