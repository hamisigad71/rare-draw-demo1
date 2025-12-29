 
// @ts-ignore - Deno types
/// <reference lib="deno.window" />
// @ts-ignore - Deno types
/// <reference lib="deno.unstable" />

// @ts-ignore - Deno module
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

import {
  createClerkClient,
  verifyToken as clerkVerifyToken,
  // @ts-ignore - Deno environment
} from "https://esm.sh/@clerk/backend@1.27.3";

// @ts-ignore - Deno global
const secretKey = Deno.env.get("CLERK_SECRET_KEY");

if (!secretKey) {
  throw new Error(
    "CLERK_SECRET_KEY environment variable is required for Clerk authentication"
  );
}

export const clerkClient = createClerkClient({ secretKey });

export type VerifiedClerkToken = Awaited<ReturnType<typeof clerkVerifyToken>>;

type TokenWithOptionalUserId = {
  userId?: string;
  user_id?: string;
  sub?: string;
  [key: string]: unknown;
};

export class ClerkAuthError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClerkAuthError";
  }
}

async function verifyClerkSessionToken(token: string) {
  if (!token) {
    throw new ClerkAuthError("Missing Clerk session token");
  }

  try {
    // Verify JWT token using Clerk's verifyToken
    // REQUIRED: JWT template named "supabase" must exist in Clerk Dashboard
    // Template must include claims: sub, user_id, email, aud, role
    const verified = await clerkVerifyToken(token, {
      secretKey,
    });
    
    return verified;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[ClerkAuth] Token verification failed:", errorMessage);
    
    throw new ClerkAuthError(
      `Unable to verify Clerk session token: ${errorMessage}`,
      {
        cause: error instanceof Error ? error : undefined,
      }
    );
  }
}

function parseAuthorizationHeader(headerValue: string | null): string {
  if (!headerValue) {
    throw new ClerkAuthError("Missing Authorization header");
  }

  const matches = headerValue.match(/^Bearer\s+(.+)$/i);

  if (!matches || matches.length < 2) {
    throw new ClerkAuthError("Invalid Authorization header format");
  }

  const token = matches[1]?.trim();

  if (!token) {
    throw new ClerkAuthError("Missing Clerk session token");
  }

  return token;
}

function ensureJwtToken(token: string) {
  const segments = token.split(".");

  if (segments.length !== 3 || segments.some((segment) => !segment.trim())) {
    throw new ClerkAuthError(
      "Invalid Clerk token format received. Expected a JWT generated from the 'supabase' template."
    );
  }
}

export async function requireClerkSession(req: Request) {
  const authorizationHeader = req.headers.get("Authorization");
  const token = parseAuthorizationHeader(authorizationHeader);

  ensureJwtToken(token);

  const claims = (await verifyClerkSessionToken(
    token
  )) as TokenWithOptionalUserId;

  return {
    token,
    claims,
  };
}

export async function requireClerkUserId(req: Request): Promise<string> {
  const { claims } = await requireClerkSession(req);
  const userId = claims.user_id ?? claims.userId ?? claims.sub;

  if (!userId) {
    throw new ClerkAuthError("Unable to determine Clerk user id");
  }

  return userId;
}

export async function getClerkUser(userId: string) {
  return await clerkClient.users.getUser(userId);
}

