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
