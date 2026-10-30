/**
 * Backend models as the API returns them.
 * Money = Decimal string ("1200.00"), dates = ISO strings, ids = numbers.
 * Grows module by module — keep one interface per backend model.
 */

export type ISODate = string;
export type Money = string;

export type UserStatus = "active" | "inactive" | "blocked";

export interface RoleRef {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  roleId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  profilePhoto: string | null;
  bio: string | null;
  status: UserStatus;
  emailVerifiedAt: ISODate | null;
  lastLoginAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  role: RoleRef;
}

/** `/auth/me` + login payload: profile plus the permission slugs of the role. */
export interface AuthUser extends User {
  permissions: string[];
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/* ───────────────────────── catalog (F2) ───────────────────────── */

export type ActiveStatus = "active" | "inactive";

export interface Ref {
  id: number;
  name: string;
  slug: string;
}

export interface PetType {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  status: ActiveStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ServiceCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  status: ActiveStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
  parent: Ref | null;
  _count?: { services: number; children: number };
  children?: ServiceCategory[];
}

export interface PersonRef {
  id: number;
  firstName: string;
  lastName: string;
  profilePhoto?: string | null;
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: Money;
  discountPrice: Money | null;
  durationMinutes: number;
  icon: string | null;
  image: string | null;
  status: ActiveStatus;
  isFeatured: boolean;
  sortOrder: number;
  maxPetsPerBooking: number;
  requiresVaccination: boolean;
  avgRating: string;
  reviewsCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
  category: Ref;
  petTypes: Ref[];
  /** detail endpoint only */
  staff?: PersonRef[];
}

export interface StaffSchedule {
  id?: number;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "HH:mm"
  endTime: string;
  isActive: boolean;
}

export interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  status: UserStatus;
  services: Ref[];
  schedules: StaffSchedule[];
}

export interface BlockedDate {
  id: number;
  staffId: number | null;
  date: ISODate;
  reason: string | null;
  createdAt: ISODate;
  staff: { id: number; firstName: string; lastName: string } | null;
}

export type DiscountType = "percentage" | "fixed";
export type PromotionScope = "all" | "specific_services" | "specific_categories";

export interface Promotion {
  id: number;
  title: string;
  code: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: Money;
  maxDiscountAmount: Money | null;
  minOrderAmount: Money | null;
  appliesTo: PromotionScope;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  startsAt: ISODate;
  endsAt: ISODate;
  bannerImage: string | null;
  status: ActiveStatus;
  createdAt: ISODate;
  services: Ref[];
  categories: Ref[];
  _count?: { usages: number };
}

export interface PromotionUsage {
  id: number;
  discountAmount: Money;
  createdAt: ISODate;
  user: { id: number; firstName: string; lastName: string; email: string };
  booking: { id: number; bookingNo: string; status: string };
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: ActiveStatus;
  isSystem: boolean;
}

/* ───────────────────────── bookings & payments (F3) ───────────────────────── */

export type PetGender = "male" | "female";
export type PetSize = "small" | "medium" | "large";

export interface Pet {
  id: number;
  userId: number;
  petTypeId: number;
  name: string;
  breed: string | null;
  gender: PetGender | null;
  size: PetSize | null;
  dateOfBirth: ISODate | null;
  weightKg: string | null;
  isVaccinated: boolean;
  photo: string | null;
  notes: string | null;
  createdAt: ISODate;
  petType: Ref;
  user?: { id: number; firstName: string; lastName: string; email: string };
}

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type BookingPaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type Currency = "BDT" | "USD";
export type PaymentMethod = "cash" | "card" | "mobile_banking" | "sslcommerz";
export type TransactionStatus = "pending" | "success" | "failed" | "cancelled" | "refunded";

export interface BookingStatusLog {
  id: number;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  note: string | null;
  createdAt: ISODate;
  changedBy: { id: number; firstName: string; lastName: string } | null;
}

export interface BookingPaymentLine {
  id: number;
  type: "payment" | "refund";
  method: PaymentMethod;
  status: TransactionStatus;
  amount: Money;
  currency: Currency;
  baseAmount: Money;
  transactionId: string;
  paidAt: ISODate | null;
  createdAt: ISODate;
}

export interface Booking {
  id: number;
  bookingNo: string;
  userId: number;
  petId: number;
  serviceId: number;
  assignedStaffId: number | null;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  servicePrice: Money;
  discountAmount: Money;
  totalAmount: Money;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  customerNote: string | null;
  cancelledAt: ISODate | null;
  cancelReason: string | null;
  createdAt: ISODate;
  service: { id: number; name: string; slug: string; durationMinutes: number; image: string | null };
  pet: { id: number; name: string; photo: string | null; petType: Ref };
  assignedStaff: PersonRef | null;
  promotion: { id: number; code: string; title: string } | null;
  user?: { id: number; firstName: string; lastName: string; email: string; phone: string | null };
  /** detail endpoints only */
  statusLogs?: BookingStatusLog[];
  payments?: BookingPaymentLine[];
}

export interface Payment {
  id: number;
  userId: number;
  bookingId: number | null;
  adoptionId: number | null;
  amount: Money;
  currency: Currency;
  exchangeRate: string;
  baseAmount: Money;
  method: PaymentMethod;
  transactionId: string;
  type: "payment" | "refund";
  status: TransactionStatus;
  note: string | null;
  paidAt: ISODate | null;
  createdAt: ISODate;
  booking: { id: number; bookingNo: string; status: BookingStatus; totalAmount: Money } | null;
  adoption: { id: number } | null;
  user?: { id: number; firstName: string; lastName: string; email: string };
  refundOf: { id: number; transactionId: string } | null;
  refunds?: { id: number; amount: Money; status: TransactionStatus }[];
}

export interface Slot {
  startTime: string;
  endTime: string;
  staff: PersonRef[];
}

export interface Availability {
  date: string;
  timezone: string;
  service: { id: number; name: string; durationMinutes: number };
  closed: boolean;
  reason: string | null;
  slots: Slot[];
}

export interface PublicSettings {
  site_name: string;
  base_currency: Currency;
  supported_currencies: Currency[];
  usd_exchange_rate: number;
  booking_advance_days: number;
  booking_cancel_before_hours: number;
  booking_payment_timeout_minutes: number;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
  social_links: Record<string, string>;
}
