export interface DeviceSlice {
  device: string;
  clicks: number;
}

export interface HourSlice {
  /** "00" – "23" */
  hour: string;
  clicks: number;
}

export interface WeekdaySlice {
  /** "Mon" – "Sun" */
  day: string;
  clicks: number;
}

export interface DaySlice {
  /** "YYYY-MM-DD" */
  date: string;
  clicks: number;
}

export interface ReferrerSlice {
  /** Hostname, or "Direct" when the visit had no referrer */
  referrer: string;
  clicks: number;
}

export interface CountrySlice {
  /** ISO 3166-1 alpha-2 code, or "Unknown" */
  country: string;
  clicks: number;
}

export interface TopLinkSlice {
  id: string;
  slug: string;
  originalUrl: string;
  clickCount: number;
}

export interface RecentClickSlice {
  id: string;
  timestamp: string;
  country: string | null;
  device: string | null;
  referrer: string | null;
  isBot: boolean;
}

/** Aggregated analytics for a single link (bots excluded from all counts). */
export interface LinkAnalytics {
  linkId: string;
  totalClicks: number;
  uniqueClicks: number;
  botClicks: number;
  devices: DeviceSlice[];
  hourly: HourSlice[];
  weekly: WeekdaySlice[];
  daily: DaySlice[];
  referrers: ReferrerSlice[];
  countries: CountrySlice[];
  recent: RecentClickSlice[];
}

/** Aggregated analytics across every link in an organization (bots excluded). */
export interface OrgAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  botClicks: number;
  linkCount: number;
  activeLinkCount: number;
  daily: DaySlice[];
  devices: DeviceSlice[];
  referrers: ReferrerSlice[];
  countries: CountrySlice[];
  topLinks: TopLinkSlice[];
}
