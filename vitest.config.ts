/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig(
  {
    test: {
      environment: "node",
      include: ["src/lib/**/*.test.ts"],
    },
  },
  {
    configFile: false,
  },
);
