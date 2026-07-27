/**
 * Represents the role of a user within an organization.
 * Can be either 'ADMIN' with full management privileges or 'MEMBER' with standard access.
 */
export type UserRole = "ADMIN" | "MEMBER";

/**
 * Represents a user in the LinkTrim platform.
 */
export interface User {
  /** The unique identifier of the user */
  id: string;
  /** The display name of the user */
  name: string;
  /** The primary email address of the user */
  email: string;
  /** Optional URL to the user's avatar image */
  avatarUrl?: string;
}

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

/**
 * Represents a shortened link managed within an organization.
 */
export interface Link {
  /** The unique identifier of the link */
  id: string;
  /** The URL-friendly slug (e.g. `summer-launch`) */
  slug: string;
  /** The original destination URL that the short URL redirects to */
  originalUrl: string;
  /** The total number of clicks this link has received */
  clickCount: number;
  /** The maximum number of clicks before the link is disabled (optional) */
  clickCap: number | null;
  /** Whether the link is currently active */
  isActive: boolean;
  /** The date and time when the link expires (optional) */
  expiresAt: string | null;
  /** The date and time when the link should become active (optional) */
  scheduledAt: string | null;
  /** The unique identifier of the user who created the link */
  createdByUserId: string;
  /** The name of the user who created the link */
  createdByName: string;
  /** The date and time when the link was created */
  createdAt: string;
}

/**
 * Represents the click and visitor analytics for a specific link.
 */
export interface LinkAnalytics {
  /** The unique identifier of the analyzed link */
  linkId: string;
  /** The total number of redirects processed for the link */
  totalClicks: number;
  /** The count of unique visitors who clicked the link */
  uniqueVisitors: number;
  /** Optional breakdown of clicks performed by specific members of the organization */
  clicksByMember?: {
    /** The unique identifier of the member who clicked or generated clicks */
    userId: string;
    /** The name of the member */
    userName: string;
    /** The number of clicks attributed to this member */
    clicks: number;
  }[];
}

/**
 * Represents a member belonging to an organization.
 */
export interface OrgMember {
  /** The unique identifier of the organization membership record */
  id: string;
  /** The unique identifier of the associated user */
  userId: string;
  /** The email address of the member */
  email: string;
  /** The name of the member */
  name: string;
  /** The role of the member within the organization */
  role: UserRole;
  /** The date and time when the member joined the organization */
  joinedAt: Date | string;
}
