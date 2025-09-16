import {defineConfig} from "vite";
import dts from "vite-plugin-dts";
import {resolve} from "path";

export default defineConfig({
  plugins: [
    // Generate ES module type declarations
    dts({
      include: ["src"],
      outDir: "dist/types/esm",
      tsconfigPath: "tsconfig.json",
      insertTypesEntry: true,
      rollupTypes: true,
      pathsToAliases: true

    }),
  ],
  build: {
    lib: {
      entry: {
        // Browser entry point
        figlet: resolve(__dirname, "src/figlet.ts"),
        // Node.js entry point
        "node-figlet": resolve(__dirname, "src/node-figlet.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const extension = format === "es" ? "mjs" : "cjs";
        return `${entryName}.${extension}`;
      },
    },
    minify: false, // Let consumers decide on minification
    rollupOptions: {
      external: [
        // Node.js built-ins that shouldn't be bundled
        "fs",
        "path",
        "util",
        "url",
      ],
      output: [
        // ES modules output
        {
          format: "es",
          entryFileNames: "[name].mjs",
          dir: "dist",
        },
        // CommonJS output
        {
          format: "cjs",
          entryFileNames: "[name].cjs",
          dir: "dist",
          exports: "auto",
        },
      ],
    },
  },
  define: {
    // Help with Node.js/browser detection
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || "development"),
  },
});
