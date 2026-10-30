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
