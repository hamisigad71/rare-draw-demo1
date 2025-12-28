import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import { CLERK_PUBLISHABLE_KEY } from "./config/clerk";
import { SupabaseAuthProvider } from "@/providers/SupabaseAuthProvider";
import { logger, updateLoggerContext } from "@/lib/logger";

logger.info("Bootstrapping RareDraw client", {
  environment: import.meta.env.MODE,
});
updateLoggerContext({ clientBootedAt: new Date().toISOString() });

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <SupabaseAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <App />
      </ThemeProvider>
    </SupabaseAuthProvider>
  </ClerkProvider>
);
