export const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomSlug(length = 8) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS.charAt(Math.floor(Math.random() * SLUG_CHARS.length));
  }
  return result;
}

export function isValidLinkSlug(value: string) {
  return /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/.test(value);
}

export const ORG_SLUG_INVALID_MESSAGE =
  "Slug must contain only lowercase letters, numbers, and hyphens.";

export function isValidOrgSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
