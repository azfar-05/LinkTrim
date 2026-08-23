export const DEVICE_CATEGORIES = [
  "Mobile",
  "Tablet",
  "Desktop",
  "TV",
  "Other",
] as const;

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegrambot|discordapp|embedly|quora|outbrain|yahoo|java|curl|wget|python-requests|httpclient|headlesschrome/i;

const MOBILE_PATTERN = /iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile|webOS|pocket/i;
const TABLET_PATTERN = /iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i;
const TV_PATTERN = /SMART-TV|SmartTV|GoogleTV|AppleTV|CrKey|HbbTV|NetCast|Roku|BRAVIA|FireTV|TV Store|Tizen.*TV/i;

/**
 * Classifies a user-agent string into a device category.
 * Returns null when the user-agent is missing or unparseable.
 */
export function parseDevice(userAgent: string | null | undefined): DeviceCategory | null {
  if (!userAgent) return null;

  if (TABLET_PATTERN.test(userAgent)) return "Tablet";
  if (MOBILE_PATTERN.test(userAgent)) return "Mobile";
  if (TV_PATTERN.test(userAgent)) return "TV";
  if (/Mobi|Mobile/i.test(userAgent)) return "Mobile";

  // Desktop UAs always contain a known desktop browser/OS token
  const isDesktop =
    /Windows NT|Macintosh|Mac OS X|X11|Linux|Cros/i.test(userAgent) &&
    /Mozilla|AppleWebKit|Gecko|Trident|Presto/i.test(userAgent);

  return isDesktop ? "Desktop" : "Other";
}

/** Returns true when the user-agent looks like a bot or crawler. */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}
