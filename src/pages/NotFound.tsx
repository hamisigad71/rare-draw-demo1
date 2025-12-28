import { useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { logger, updateLoggerContext } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();
  const notFoundLogger = useMemo(
    () => logger.withContext({ screen: "not-found" }),
    []
  );

  useEffect(() => {
    updateLoggerContext({ screen: "not-found", currentRoute: location.pathname });
    notFoundLogger.warn("404 route visited", {
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search, notFoundLogger]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
