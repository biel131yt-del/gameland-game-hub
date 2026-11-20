import { createServerFn } from "@tanstack/react-start";

import { readCatalog } from "./neon.server";

export const loadCatalog = createServerFn({ method: "GET" }).handler(() => readCatalog());
