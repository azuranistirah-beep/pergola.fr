import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except:
    // - Next internals (_next, _vercel)
    // - Admin routes (single-locale internal tool)
    // - Static assets with a file extension
    // - API routes handled separately
    "/((?!api|admin|_next|_vercel|.*\\..*).*)",
  ],
};
