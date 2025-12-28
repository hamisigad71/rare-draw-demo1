import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";
import { logger, toErrorMetadata } from "@/lib/logger";

function isLikelyJwt(token: string | null): token is string {
  if (!token) {
    return false;
  }

  const segments = token.split(".");

  if (segments.length !== 3) {
    return false;
  }

  return segments.every(Boolean);
}

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const authLogger = useMemo(() => logger.withContext({ feature: "auth" }), []);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!getToken) {
      return null;
    }

    try {
      // Request JWT using the 'supabase' template configured in Clerk Dashboard
      const token = await getToken({ template: "supabase" });

      if (!token) {
        authLogger.warn(
          "Clerk returned an empty token for the 'supabase' template",
          { userId: user?.id ?? null }
        );
        return null;
      }

      if (!isLikelyJwt(token)) {
        authLogger.error("Received malformed JWT from Clerk", {
          userId: user?.id ?? null,
        });
        return null;
      }

      return token;
    } catch (error) {
      authLogger.error("Failed to retrieve Clerk token", {
        userId: user?.id ?? null,
        error: toErrorMetadata(error),
      });
      return null;
    }
  }, [authLogger, getToken, user?.id]);

  const signOutUser = useCallback(async () => {
    if (!signOut) {
      return;
    }

    await signOut();
  }, [signOut]);

  return {
    user,
    userId: user?.id ?? null,
    isLoaded,
    isSignedIn: !!isSignedIn,
    getAuthToken,
    signOut: signOutUser,
    authProvider: "clerk" as const,
  };
}
