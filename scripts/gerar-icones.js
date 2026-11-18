// Gera os ícones do PWA a partir do símbolo "quiz" do Material Symbols (Google).
// Fonte: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:quiz:FILL@1
// Uso: npm run icones   (grava em public/, que o Vite copia para o build)
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const COR_FUNDO = "#2f5bd3"; // mesma cor de destaque do estilo.css
const COR_SIMBOLO = "#ffffff";

// Desenho original do símbolo (viewBox 0 -960 960 960).
const SIMBOLO_QUIZ =
  "M572-352q12-12 12-29t-12-29q-12-12-29-12t-29 12q-12 12-12 29t12 29q12 12 29 12t29-12Zm-30-114q10 0 16.5-6.5T567-489q2-14 11-27.5t28-31.5q28-27 38-46t10-45q0-46-31.5-75T540-743q-32 0-59 15t-43 42q-5 8-1 17t14 14q9 4 18 .5t15-11.5q11-16 25-23.5t31-7.5q29 0 48 17t19 43q0 19-9 33.5T566-570q-22 18-33.5 38.5T519-489q-1 9 6 16t17 7ZM260-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h560q24 0 42 18t18 42v560q0 24-18 42t-42 18H260ZM140-80q-24 0-42-18t-18-42v-590q0-13 8.5-21.5T110-760q13 0 21.5 8.5T140-730v590h590q13 0 21.5 8.5T760-110q0 13-8.5 21.5T730-80H140Z";

/**
 * Monta o SVG do ícone: fundo colorido com o símbolo branco centralizado.
 * @param tamanho      lado do ícone em pixels
 * @param proporcao    fração do lado ocupada pelo símbolo
 * @param cantos       raio dos cantos (0 = quadrado, para ícones "maskable")
 */
function montarSvg(tamanho, proporcao, cantos) {
  const lado = tamanho * proporcao;
  const margem = (tamanho - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">
  <rect width="${tamanho}" height="${tamanho}" rx="${cantos}" fill="${COR_FUNDO}"/>
  <svg x="${margem}" y="${margem}" width="${lado}" height="${lado}" viewBox="0 -960 960 960">
    <path d="${SIMBOLO_QUIZ}" fill="${COR_SIMBOLO}"/>
  </svg>
</svg>`;
}

async function gerarPng(arquivo, svg) {
  await sharp(Buffer.from(svg)).png().toFile(arquivo);
  console.log("gerado:", arquivo);
}

mkdirSync("public/icones", { recursive: true });

// Ícone da aba do navegador (vetorial, cantos arredondados).
writeFileSync("public/favicon.svg", montarSvg(64, 0.72, 14));
console.log("gerado: public/favicon.svg");

// Ícones "any": usados como estão, com cantos arredondados.
await gerarPng("public/icones/icone-192.png", montarSvg(192, 0.62, 42));
await gerarPng("public/icones/icone-512.png", montarSvg(512, 0.62, 112));

// Ícone "maskable": o Android recorta no formato do aparelho (círculo, gota...).
// Fundo sem cantos e símbolo menor, dentro da "zona segura" central de 80%.
await gerarPng("public/icones/icone-maskable-512.png", montarSvg(512, 0.5, 0));

// iOS: o próprio sistema arredonda os cantos; tamanho padrão de 180 px.
await gerarPng("public/icones/apple-touch-icon.png", montarSvg(180, 0.58, 0));
