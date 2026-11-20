import { createFileRoute } from "@tanstack/react-router";

import { getAdmin, postAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      GET: ({ request }) => getAdmin(request),
      POST: ({ request }) => postAdmin(request),
    },
  },
});
