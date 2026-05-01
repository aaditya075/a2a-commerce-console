import crypto from "node:crypto";
import Database from "better-sqlite3";

export type TokenClaims = {
  v: "a2a-token/0.1";
  tenantId: string;
  agentId: string;
  keyId: string;
  iat: string;
};

function timingSafeEqualStr(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyToken(db: Database.Database, token: string, secret: string) {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return { ok: false as const, error: "malformed_token" };

  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { ok: false as const, error: "bad_payload" };
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadJson)
    .digest("base64url");
  if (!timingSafeEqualStr(expectedSig, sig)) {
    return { ok: false as const, error: "bad_signature" };
  }

  let claims: TokenClaims;
  try {
    claims = JSON.parse(payloadJson) as TokenClaims;
  } catch {
    return { ok: false as const, error: "bad_claims" };
  }

  if (claims?.v !== "a2a-token/0.1") return { ok: false as const, error: "bad_version" };
  if (!claims.tenantId || !claims.agentId || !claims.keyId) {
    return { ok: false as const, error: "missing_fields" };
  }

  const keyRow = db
    .prepare(
      "select id, tenant_id as tenantId, agent_id as agentId, revoked_at as revokedAt from agent_keys where id = ?",
    )
    .get(claims.keyId) as
    | { id: string; tenantId: string; agentId: string; revokedAt: string | null }
    | undefined;

  if (!keyRow) return { ok: false as const, error: "unknown_key" };
  if (keyRow.revokedAt) return { ok: false as const, error: "revoked_key" };
  if (keyRow.tenantId !== claims.tenantId || keyRow.agentId !== claims.agentId) {
    return { ok: false as const, error: "key_mismatch" };
  }

  return { ok: true as const, claims };
}

