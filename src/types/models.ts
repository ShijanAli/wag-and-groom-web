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
  createdAt?: ISODate;
  /** list endpoint */
  _count?: { users: number; permissions?: number };
  /** detail endpoint */
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  description?: string | null;
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
  opening_hours?: OpeningDay[];
}

/** One weekday of the `opening_hours` setting (0 = Sunday … 6 = Saturday), Dhaka local time. */
export interface OpeningDay {
  day: number;
  open: boolean;
  opens: string; // HH:mm
  closes: string; // HH:mm
}

/* ───────────────────────── adoption (F4) ───────────────────────── */

export type AdoptionPetStatus = "available" | "pending" | "adopted" | "on_hold";
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "cancelled";
export type AdoptionStatus = "in_progress" | "completed" | "cancelled";
export type HomeType = "house" | "apartment";

export interface AdoptionPetImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AdoptionPet {
  id: number;
  petTypeId: number;
  name: string;
  slug: string;
  breed: string | null;
  gender: PetGender;
  ageMonths: number;
  size: PetSize | null;
  color: string | null;
  description: string;
  healthStatus: string | null;
  isVaccinated: boolean;
  isNeutered: boolean;
  adoptionFee: Money;
  status: AdoptionPetStatus;
  isFeatured: boolean;
  createdAt: ISODate;
  petType: Ref;
  _count?: { favorites: number };
  /** list endpoint: cover image URL */
  primaryImage?: string | null;
  /** detail endpoint: every image, cover first */
  images?: AdoptionPetImage[];
  isFavorite?: boolean;
}

/** Pet summary embedded in applications / adoptions. */
export interface AdoptionPetSummary {
  id: number;
  name: string;
  slug: string;
  status: AdoptionPetStatus;
  adoptionFee?: Money;
  petType: Ref;
  images: AdoptionPetImage[];
}

export interface AdoptionApplication {
  id: number;
  applicationNo: string;
  adoptionPetId: number;
  userId: number;
  homeType: HomeType;
  hasYard: boolean;
  hasOtherPets: boolean;
  otherPetsDetails: string | null;
  hasChildren: boolean;
  experience: string | null;
  reason: string;
  status: ApplicationStatus;
  reviewedAt: ISODate | null;
  adminNote: string | null;
  createdAt: ISODate;
  adoptionPet: AdoptionPetSummary;
  adoption: { id: number; status: AdoptionStatus; feeAmount: Money; feePaid: Money } | null;
  user?: { id: number; firstName: string; lastName: string; email: string; phone: string | null; address: string | null };
  reviewedBy?: { id: number; firstName: string; lastName: string } | null;
}

export interface Adoption {
  id: number;
  applicationId: number;
  adoptionPetId: number;
  userId: number;
  status: AdoptionStatus;
  adoptionDate: string; // YYYY-MM-DD
  feeAmount: Money;
  feePaid: Money;
  feeDue: number;
  contractFile: string | null;
  followUpDate: string | null;
  completedAt: ISODate | null;
  cancelledAt: ISODate | null;
  cancelReason: string | null;
  createdAt: ISODate;
  adoptionPet: AdoptionPetSummary;
  application: { id: number; applicationNo: string };
  user?: { id: number; firstName: string; lastName: string; email: string; phone?: string | null };
  /** detail endpoints */
  payments?: BookingPaymentLine[];
}

export interface FavoritePet extends Omit<AdoptionPet, "images" | "isFavorite"> {
  primaryImage: string | null;
  favoritedAt: ISODate;
}

/* ───────────────────────── content (F5) ───────────────────────── */

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewImage {
  id: number;
  image: string;
}

/** /me/reviews and /reviews (admin adds `user`) */
export interface Review {
  id: number;
  bookingId: number;
  userId: number;
  serviceId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  adminReply: string | null;
  repliedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  service: { id: number; name: string; slug: string };
  booking: { id: number; bookingNo: string; bookingDate: ISODate };
  images: ReviewImage[];
  user?: { id: number; firstName: string; lastName: string; email: string };
}

/** Public: GET /services/:slug/reviews */
export interface PublicReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  adminReply: string | null;
  repliedAt: ISODate | null;
  createdAt: ISODate;
  user: { firstName: string; profilePhoto: string | null };
  images: ReviewImage[];
}

export interface RatingSummary {
  serviceId: number;
  averageRating: number;
  totalReviews: number;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface GalleryAlbum {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  /** coverImage, or the first item's image */
  cover: string | null;
  sortOrder: number;
  status: ActiveStatus;
  itemCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type MediaType = "image" | "video";

export interface GalleryItem {
  id: number;
  albumId: number | null;
  serviceId: number | null;
  title: string | null;
  caption: string | null;
  mediaType: MediaType;
  fileUrl: string;
  thumbnailUrl: string | null;
  beforeImageUrl: string | null;
  altText: string | null;
  isFeatured: boolean;
  sortOrder: number;
  status: ActiveStatus;
  createdAt: ISODate;
  album: { id: number; title: string; slug: string } | null;
  service: { id: number; name: string; slug: string } | null;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  status: ActiveStatus;
  createdAt: ISODate;
}

export type PostStatus = "draft" | "published";

export interface BlogPost {
  id: number;
  categoryId: number;
  authorId: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: PostStatus;
  publishedAt: ISODate | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  category: { id: number; name: string; slug: string };
  author: { id: number; firstName: string; lastName: string; profilePhoto: string | null };
  /** Detail only */
  content?: string;
  readingTimeMinutes?: number;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  status: ActiveStatus;
  createdAt: ISODate;
}

export interface FaqGroup {
  category: string | null;
  faqs: Faq[];
}

export interface Testimonial {
  id: number;
  userId: number | null;
  adoptionId: number | null;
  name: string;
  content: string;
  image: string | null;
  rating: number;
  isFeatured: boolean;
  status: ActiveStatus;
  createdAt: ISODate;
}

export type ContactStatus = "new" | "read" | "replied";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: ISODate;
}

export type SubscriptionStatus = "subscribed" | "unsubscribed";

export interface NewsletterSubscriber {
  id: number;
  email: string;
  status: SubscriptionStatus;
  subscribedAt: ISODate;
  unsubscribedAt: ISODate | null;
}

/* ───────────────────────── system (F6) ───────────────────────── */

export interface DashboardStats {
  generatedAt: ISODate;
  currency: Currency;
  users: { customers: number; staff: number; newCustomersThisMonth: number };
  bookings: { today: number; upcoming: number; pending: number; completedThisMonth: number };
  revenue: { thisMonth: number; lastMonth: number; total: number; growthPercent: number | null };
  adoption: { availablePets: number; pendingApplications: number; inProgress: number; completedThisMonth: number };
  reviews: { pending: number; averageRating: number | null };
  inbox: { newMessages: number; subscribers: number };
}

export interface RevenuePoint {
  period: string;
  bookings: number;
  adoptions: number;
  total: number;
  /** number of successful payments in the period */
  payments: number;
}

export interface RevenueReport {
  from: string;
  to: string;
  groupBy: "day" | "month";
  currency: Currency;
  total: number;
  series: RevenuePoint[];
}

export interface TopService {
  service: { id: number; name: string; slug: string; avgRating: string };
  bookings: number;
  bookedValue: number;
}

export type BookingsByStatus = Record<BookingStatus, number>;

export type SettingGroup = "general" | "payment" | "booking" | "notification";

export interface Setting {
  id: number;
  key: string;
  value: unknown;
  group: SettingGroup;
  isPublic: boolean;
  readonly: boolean;
  description: string | null;
  updatedAt: ISODate;
}

export type LogAction = "create" | "update" | "delete";

export interface ActivityLog {
  id: number;
  userId: number | null;
  action: LogAction;
  modelType: string | null;
  modelId: number | null;
  oldValues: Record<string, unknown> | null;
  newValues: { body?: Record<string, unknown>; route?: string; summary?: string; [k: string]: unknown } | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: ISODate;
  user: { id: number; firstName: string; lastName: string; email: string } | null;
}

/** GET /pets (admin): a customer's pet with its owner */
export interface AdminPet extends Pet {
  user: { id: number; firstName: string; lastName: string; email: string; phone: string | null };
}
