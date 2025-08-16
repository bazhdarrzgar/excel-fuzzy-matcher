/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

const port = parseInt(Deno.env.get("PORT") || "3000");

console.log(`🚀 Fuzzy Matcher App starting on port ${port}`);
console.log(`🌐 Access at: http://localhost:${port}`);

await start(manifest, { 
  ...config, 
  port,
  hostname: "0.0.0.0"
});