// Histórico das questões já respondidas, salvo só neste navegador.
// Formato: { "<idQuestao>": { vezes, acertos, ultima } }
//   vezes   -> quantas vezes a questão foi respondida
//   acertos -> quantas dessas foram certas
//   ultima  -> data/hora (ms) da última resposta

import { lerLocal, gravarLocal, removerLocal } from "./armazenamento.js";

const CHAVE = "historico";

export function lerHistorico() {
  const historico = lerLocal(CHAVE);
  return historico && typeof historico === "object" ? historico : {};
}

/** Registra uma resposta e devolve o histórico atualizado. */
export function registrarResposta(historico, idQuestao, acertou) {
  const anterior = historico[idQuestao] || { vezes: 0, acertos: 0 };
  const novo = {
    ...historico,
    [idQuestao]: {
      vezes: anterior.vezes + 1,
      acertos: anterior.acertos + (acertou ? 1 : 0),
      ultima: Date.now(),
    },
  };
  gravarLocal(CHAVE, novo);
  return novo;
}

export function limparHistorico() {
  removerLocal(CHAVE);
  return {};
}
