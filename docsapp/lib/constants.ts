import { config as privateRoutes } from "@/proxy";

export const PRIVATE_ROUTES = privateRoutes.matcher.map((item) =>
  item.replace("/:path*", ""),
);
