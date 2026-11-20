import { createFileRoute } from "@tanstack/react-router";

import { handleError, jsonObject, recordSale, respond, storefrontDb } from "@/lib/sales-api.server";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await jsonObject(request);
          return respond(await recordSale(storefrontDb(), data), 201);
        } catch (error) {
          return handleError(error);
        }
      },
    },
  },
});
