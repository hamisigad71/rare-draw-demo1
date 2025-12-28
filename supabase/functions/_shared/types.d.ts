declare module "https://esm.sh/@clerk/backend@1.27.3" {
  export interface CreateClerkClientOptions {
    secretKey: string;
  }

  export interface ClerkUserResource {
    getUser(userId: string): Promise<unknown>;
  }

  export interface ClerkClient {
    users: ClerkUserResource;
  }

  export interface VerifyTokenOptions {
    secretKey?: string;
    jwtKey?: string;
    audience?: string | string[];
    issuer?: string | string[];
    authorizedParties?: string[];
  }

  export function createClerkClient(
    options: CreateClerkClientOptions
  ): ClerkClient;

  export function verifyToken<T = Record<string, unknown>>(
    token: string,
    options: VerifyTokenOptions
  ): Promise<T>;
}
