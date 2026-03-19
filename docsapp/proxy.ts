import { type NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default function proxy(req: NextRequestWithAuth) {
  return withAuth(req);
}

export const config = {
  matcher: ["/docs/secrets/:path*"],
};
