import { createVerify } from "node:crypto";
import type { Request } from "express";

const firebaseProjectId =
  process.env.FIREBASE_PROJECT_ID ?? "upsclogin-1474f";
const adminEmail = "spotifypremiumfor3month@gmail.com";

type FirebaseCerts = Record<string, string>;
let cachedCerts: FirebaseCerts | null = null;
let certsExpiresAt = 0;

async function getFirebaseCerts(): Promise<FirebaseCerts> {
  if (cachedCerts && Date.now() < certsExpiresAt) return cachedCerts;

  const response = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
  );
  if (!response.ok) throw new Error("Unable to fetch Firebase signing certificates");

  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] ?? 3600);
  cachedCerts = (await response.json()) as FirebaseCerts;
  certsExpiresAt = Date.now() + maxAge * 1000;
  return cachedCerts;
}

function decodePart(value: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

export async function isFirebaseAdminRequest(req: Request): Promise<boolean> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return false;

  const idToken = authorization.slice("Bearer ".length).trim();
  if (!idToken) return false;

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = idToken.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) return false;

    const header = decodePart(encodedHeader);
    const payload = decodePart(encodedPayload);
    if (header.alg !== "RS256" || typeof header.kid !== "string") return false;

    const now = Math.floor(Date.now() / 1000);
    const issuer = `https://securetoken.google.com/${firebaseProjectId}`;
    if (
      payload.aud !== firebaseProjectId ||
      payload.iss !== issuer ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0 ||
      typeof payload.exp !== "number" ||
      payload.exp <= now ||
      typeof payload.iat !== "number" ||
      payload.iat > now + 300 ||
      payload.email !== adminEmail ||
      payload.email_verified !== true
    ) {
      return false;
    }

    const cert = (await getFirebaseCerts())[header.kid];
    if (!cert) return false;

    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();
    return verifier.verify(cert, Buffer.from(encodedSignature, "base64url"));
  } catch {
    return false;
  }
}