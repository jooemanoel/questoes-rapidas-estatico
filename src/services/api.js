// Camada de acesso à API.
// Os componentes não chamam fetch diretamente: pedem os dados a estas funções.
// Assim, se a API mudar, só este arquivo precisa ser alterado.

import { lerLocal, gravarLocal } from "./armazenamento.js";

// Troque o sufixo se o formato salvo das questões mudar: força um novo download.
const CHAVE_QUESTOES = "questoes-v1";

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

/**
 * Devolve as questões usando a cópia salva no navegador sempre que possível.
 *
 * 1. Pergunta à API quando a lista foi alterada pela última vez (1 leitura no Firebase).
 * 2. Se a cópia local tem a mesma data, usa a cópia: nenhuma questão é baixada.
 * 3. Senão, baixa a lista completa e salva junto com a data.
 *
 * Sem rede, usa a cópia local (se existir), mesmo sem conseguir conferir a data.
 * Retorna { questoes, origem: "cache" | "rede" }.
 */
export async function carregarQuestoes() {
  const salvo = lerLocal(CHAVE_QUESTOES); // { atualizadoEm, questoes } ou null
  const temCopia = Array.isArray(salvo?.questoes);

  let atualizadoEm = null;
  try {
    ({ atualizadoEm = null } = await buscarJson("/questoes/versao"));
  } catch (erro) {
    // Sem rede: a cópia salva é a melhor opção.
    if (temCopia) return { questoes: salvo.questoes, origem: "cache" };
    // Sem cópia (ou API antiga, sem a rota /versao): tenta baixar a lista mesmo assim.
    console.warn("Não foi possível conferir a versão das questões:", erro);
  }

  // atualizadoEm === null: a data é desconhecida; não dá para confiar na
  // cópia, então baixa a lista (e não salva).
  if (temCopia && atualizadoEm !== null && salvo.atualizadoEm === atualizadoEm) {
    return { questoes: salvo.questoes, origem: "cache" };
  }

  try {
    const questoes = await buscarQuestoes();
    // A data foi lida ANTES da lista: se algo mudou no meio, a data salva
    // fica mais antiga que a real e a próxima abertura baixa de novo (seguro).
    if (atualizadoEm !== null) gravarLocal(CHAVE_QUESTOES, { atualizadoEm, questoes });
    return { questoes, origem: "rede" };
  } catch (erro) {
    if (temCopia) return { questoes: salvo.questoes, origem: "cache" };
    throw erro;
  }
}

/** Lista plana de tópicos do edital (ver data/conteudo.json na API). */
export async function buscarConteudo() {
  return buscarJson("/conteudo");
}
