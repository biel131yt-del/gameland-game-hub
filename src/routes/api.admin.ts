import { createFileRoute } from "@tanstack/react-router";

import { getAdmin, postAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      GET: ({ request }) =>
        import.meta.env.MODE === "sites" ? new Response(null, { status: 404 }) : getAdmin(request),
      POST: ({ request }) =>
        import.meta.env.MODE === "sites" ? new Response(null, { status: 404 }) : postAdmin(request),
    },
  },
});
