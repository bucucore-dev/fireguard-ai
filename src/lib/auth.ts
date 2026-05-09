import crypto from "crypto";

export function generateToken(payload: { id: string; email: string; role: string }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.randomBytes(16).toString("hex");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const [data] = token.split(".");
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

export function generateApiKey(): string {
  // Generate API key dengan prefix "fg_" (FireGuard)
  // Format: fg_[48 karakter hex]
  // Contoh: fg_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6
  return `fg_${crypto.randomBytes(24).toString("hex")}`;
}
