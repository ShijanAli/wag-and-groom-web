/**
 * Feature switches.
 *
 * Payments are OFF for now (bookings only). Set NEXT_PUBLIC_PAYMENTS_ENABLED=true to show the
 * payment screens again (customer "Payments" tab, admin Payments page, "Record payment" /
 * "Refund" actions, payment columns and filters).
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
