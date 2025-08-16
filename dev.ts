#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

const port = parseInt(Deno.env.get("PORT") || "3000");

await dev(import.meta.url, "./main.ts", {
  ...config,
  port,
});