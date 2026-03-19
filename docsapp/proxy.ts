import { type NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default function proxy(req: NextRequestWithAuth) {
  return withAuth(req);
}

export const config = {
  // Next.js requires `matcher` to be statically analyzable.
  matcher: ["/docs/secrets/:path*"],
};
