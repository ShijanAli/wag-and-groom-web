"use client";

import { z } from "zod";
import { SelectField, TextareaField, TextField } from "@/components/common/form/fields";
import { FormModal } from "@/components/common/form/FormModal";
import { formatMoney } from "@/lib/format";
import type { Payment } from "@/types/models";
import { METHOD_LABEL, refundable, useRecordPayment, useRefund } from "./api";

const COUNTER_METHODS = (["cash", "card", "mobile_banking"] as const).map((v) => ({ value: v, label: METHOD_LABEL[v] }));

/** Counter payment (cash / card / bKash) for a booking or an adoption fee. Amount defaults to what is still due. */
export function RecordPaymentModal({
  target,
  due,
  open,
  onOpenChange,
}: {
  /** `{ bookingId }` or `{ adoptionId }` + a reference shown in the header */
  target: ({ bookingId: number } | { adoptionId: number }) & { reference: string } | null;
  due: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const record = useRecordPayment();
  const schema = z.object({
    amount: z
      .number({ required_error: "Enter an amount", invalid_type_error: "Enter an amount" })
      .positive("Must be more than 0")
      .max(due || Number.MAX_SAFE_INTEGER, `At most ${formatMoney(due)} is due`),
    method: z.enum(["cash", "card", "mobile_banking"]),
    note: z.string().trim().max(500),
  });
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Record payment"
      description={target ? `${target.reference} · ${formatMoney(due)} due` : undefined}
      schema={schema}
      defaultValues={{ amount: due || undefined, method: "cash", note: "" }}
      submitText="Record payment"
      onSubmit={({ amount, method, note }) => {
        const { reference: _ref, ...ref } = target!;
        return record.mutateAsync({ ...ref, amount, method, note: note || undefined });
      }}
    >
      <TextField name="amount" label="Amount" type="number" min={0} step="0.01" leading="৳" required />
      <SelectField name="method" label="Method" options={COUNTER_METHODS} />
      <TextareaField name="note" label="Note" rows={2} placeholder="Receipt no., who received it…" />
    </FormModal>
  );
}

/** Full or partial refund of a successful payment (in the payment's currency). */
export function RefundModal({ payment, open, onOpenChange }: { payment: Payment | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const refund = useRefund();
  const max = payment ? refundable(payment) : 0;
  const schema = z.object({
    amount: z
      .number({ required_error: "Enter an amount", invalid_type_error: "Enter an amount" })
      .positive("Must be more than 0")
      .max(max, `At most ${payment ? formatMoney(max, payment.currency) : max} can be refunded`),
    reason: z.string().trim().min(3, "Tell us why (3+ characters)").max(255),
  });
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Refund payment"
      description={payment ? `${payment.transactionId} · up to ${formatMoney(max, payment.currency)}` : undefined}
      schema={schema}
      defaultValues={{ amount: max || undefined, reason: "" }}
      submitText="Refund"
      onSubmit={(v) => refund.mutateAsync({ id: payment!.id, amount: v.amount, reason: v.reason })}
    >
      <TextField name="amount" label="Amount" type="number" min={0} step="0.01" leading={payment?.currency === "USD" ? "$" : "৳"} required />
      <TextareaField name="reason" label="Reason" rows={2} placeholder="e.g. Booking cancelled by the shop" />
      {payment?.method === "sslcommerz" && <p className="text-xs text-muted-foreground">Online payments are refunded to the customer's original method through SSLCommerz.</p>}
    </FormModal>
  );
}
