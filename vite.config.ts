import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "html-date-transform",
      transformIndexHtml(html) {
        return html.replaceAll("%__DATE__%", new Date().toISOString());
      },
    },
  ],
  test: {
    include: ["src/**/*.test.ts", "app/**/*.test.ts"],
    exclude: ["src/deps_test.ts", "**/node_modules/**"],
    passWithNoTests: true,
    coverage: {
      include: ["src/**/*.ts", "app/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "src/deps_test.ts",
        "src/test/**",
      ],
    },
  },
});
