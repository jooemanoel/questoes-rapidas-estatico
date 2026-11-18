// Camada de acesso à API.
// Os componentes não chamam fetch diretamente: pedem os dados a estas funções.
// Assim, se a API mudar, só este arquivo precisa ser alterado.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function buscarJson(caminho) {
  const resposta = await fetch(`${API_URL}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho} (HTTP ${resposta.status})`);
  }
  return resposta.json();
}

/**
 * Converte o gabarito para "C" (Certo) ou "E" (Errado).
 * Aceita variações como "c", "Certo", "ERRADO".
 */
function normalizarGabarito(valor) {
  const letra = String(valor ?? "").trim().toUpperCase().charAt(0);
  return letra === "C" || letra === "E" ? letra : null;
}

/**
 * Formato de questão esperado no Firestore (coleção "questoes"):
 * {
 *   enunciado:  "Texto do item a ser julgado",      (obrigatório)
 *   gabarito:   "C" ou "E",                         (obrigatório)
 *   comentario: "Crítica/justificativa do gabarito", (opcional)
 *   textoBase:  "Texto de apoio do item",            (opcional)
 *   codigo:     "Trecho de código do item",          (opcional, exibido em fonte monoespaçada)
 *   topicoId:   "1.3.3.2",                           (opcional, id do conteudo.json)
 *   revisada:   false                                (opcional, false = ainda não conferida)
 * }
 */
export async function buscarQuestoes() {
  const questoes = await buscarJson("/questoes");

  return questoes
    .map((q) => ({
      id: q.id,
      enunciado: q.enunciado,
      textoBase: q.textoBase || "",
      codigo: q.codigo || "",
      gabarito: normalizarGabarito(q.gabarito),
      comentario: q.comentario || "",
      topicoId: q.topicoId || null,
      revisada: q.revisada !== false, // só é "não revisada" se marcada explicitamente
    }))
    // Descarta registros incompletos para não quebrar a tela.
    .filter((q) => q.enunciado && q.gabarito);
}

/** Lista plana de tópicos do edital (ver data/conteudo.json na API). */
export async function buscarConteudo() {
  return buscarJson("/conteudo");
}
