import crypto from "node:crypto";

export function sha256Base64Url(input: string) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

export function signHmacSha256Base64Url(secret: string, payload: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export function randomId(prefix?: string) {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

