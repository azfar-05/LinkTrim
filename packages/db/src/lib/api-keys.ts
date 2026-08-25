import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "lt";
const KEY_LENGTH = 32;

export function generateApiKey(): { plaintext: string; hashed: string; prefix: string } {
  const raw = randomBytes(KEY_LENGTH).toString("base64url");
  const plaintext = `${KEY_PREFIX}_${raw}`;
  const hashed = hashApiKey(plaintext);
  const prefix = plaintext.slice(0, 12);

  return { plaintext, hashed, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
