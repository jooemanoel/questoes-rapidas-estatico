import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // O plugin do Vue permite usar componentes de arquivo único (.vue).
  plugins: [vue()],

  // Caminhos relativos ("./assets/...") para funcionar no GitHub Pages,
  // que publica o site em https://<usuario>.github.io/<repositorio>/.
  base: "./",

  build: {
    // O GitHub Pages pode publicar a pasta /docs do branch principal.
    outDir: "docs",
  },
});
