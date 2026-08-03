export const RESERVED_SLUGS = new Set([
  "login",
  "orgs",
  "api",
  "not-found",
  "manifest",
  "favicon",
  "_next",
  "admin",
  "dashboard",
  "settings",
  "profile",
  "account",
  "help",
  "support",
  "status",
  "docs",
  "terms",
  "privacy",
  "pricing",
  "about",
  "contact",
  "blog",
  "home",
  "index",
]);

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug);
}

export function reservedSlugMessage(slug: string) {
  return `"${slug}" is a reserved slug`;
}
