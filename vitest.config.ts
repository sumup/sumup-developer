import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    mockReset: true,
    clearMocks: true,
  },
});
