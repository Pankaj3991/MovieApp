// lib/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from "jose";

export interface CustomJWTPayload extends JWTPayload {
  _id: string;
  role: string;
  email: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const alg = "HS256";

// Create JWT
export async function signJWT(payload: CustomJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify JWT
export async function verifyJWT(token: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify<CustomJWTPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
}
