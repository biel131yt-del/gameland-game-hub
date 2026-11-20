import { createFileRoute } from "@tanstack/react-router";

import { handleError, storefrontDb } from "@/lib/sales-api.server";

export const Route = createFileRoute("/api/category-photo/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const [photo] = await storefrontDb()`
            select mime, data_base64 from category_images where category_id = ${params.id}
          `;
          if (!photo) return new Response(null, { status: 404 });
          const bytes = Uint8Array.from(atob(String(photo["data_base64"])), (character) =>
            character.charCodeAt(0),
          );
          return new Response(bytes, {
            headers: {
              "content-type": String(photo["mime"]),
              "cache-control": "public, max-age=60",
              "x-content-type-options": "nosniff",
              "content-security-policy": "default-src 'none'; sandbox",
            },
          });
        } catch (error) {
          return handleError(error);
        }
      },
    },
  },
});
