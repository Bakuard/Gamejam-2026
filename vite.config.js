import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import checker from "vite-plugin-checker";
import svgLoader from "vite-svg-loader";
import path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    svgLoader(),
    checker({
      vueTsc: false,
    }),
    basicSsl(),
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
