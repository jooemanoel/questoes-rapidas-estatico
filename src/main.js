// Ponto de entrada: cria a aplicação Vue e a monta na <div id="app"> do index.html.
import { createApp } from "vue";
import App from "./App.vue";
import "./estilo.css";

createApp(App).mount("#app");

// PWA: registra o service worker (public/sw.js) só na versão publicada.
// Em desenvolvimento ele ficaria servindo arquivos antigos do cache.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((erro) => console.error("Falha ao registrar o service worker:", erro));
  });
}
