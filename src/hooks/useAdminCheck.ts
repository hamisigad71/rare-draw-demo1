import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { userHasRole } from "@/repositories/adminRepository";
import { logger, toErrorMetadata } from "@/lib/logger";

export function useAdminCheck() {
  const { userId, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adminLogger = useMemo(
    () => logger.withContext({ hook: "useAdminCheck" }),
    []
  );

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isLoaded || !userId) {
        setIsAdmin(false);
        setIsLoading(false);
        adminLogger.debug("Skipping admin check", { isLoaded, userId });
        return;
      }

      try {
        const hasAdminRole = await userHasRole(userId, "admin");
        setIsAdmin(hasAdminRole);
        adminLogger.info("Admin status evaluated", { userId, isAdmin: hasAdminRole });
      } catch (error) {
        adminLogger.error("Failed to verify admin status", {
          userId,
          error: toErrorMetadata(error),
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [adminLogger, isLoaded, userId]);

  return { isAdmin, isLoading };
}
