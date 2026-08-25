/**
 * Represents the role of a user within an organization.
 * Can be either 'ADMIN' with full management privileges or 'MEMBER' with standard access.
 */
export type UserRole = "ADMIN" | "MEMBER";

/**
 * Represents a workspace or organization managing grouped short links.
 */
export interface Organization {
  /** The unique identifier of the organization */
  id: string;
  /** The human-readable name of the organization */
  name: string;
  /** The URL-friendly unique slug of the organization */
  slug: string;
  /** Optional URL to the organization's logo image */
  logoUrl?: string;
  /** The total number of members in this organization */
  memberCount: number;
  /** The role of the currently logged-in user in this organization */
  currentUserRole: UserRole;
  /** The date and time when the organization was created */
  createdAt: Date | string;
}
