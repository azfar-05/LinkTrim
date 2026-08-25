export type LinkRow = {
  id: string;
  slug: string;
  originalUrl: string;
  clickCount: number;
  clickCap: number | null;
  isActive: boolean;
  expiresAt: string | null;
  scheduledAt: string | null;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
};
