/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";

export default getViteConfig(
  {
    resolve: {
      alias: {
        "@components": fileURLToPath(
          new URL("./src/components", import.meta.url),
        ),
        "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      },
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.{ts,tsx}"],
    },
  },
  {
    configFile: false,
    integrations: [react()],
  },
);
