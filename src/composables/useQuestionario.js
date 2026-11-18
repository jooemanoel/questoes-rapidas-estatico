// Composable: reúne o estado e as regras da sessão de estudo.
// Os componentes só exibem dados e avisam o que o usuário fez;
// quem decide o que acontece em seguida é este arquivo.

import { ref, computed } from "vue";
import { buscarQuestoes, buscarConteudo } from "../services/api.js";

/**
 * A tela está sempre em UMA destas etapas:
 *   "carregando"  -> buscando dados na API
 *   "erro"        -> a busca falhou
 *   "vazio"       -> não há questões cadastradas
 *   "respondendo" -> questão na tela, aguardando Certo/Errado
 *   "corrigida"   -> resposta dada, crítica visível
 *   "fim"         -> todas as questões respondidas
 */
export function useQuestionario() {
  // ---------- Estado ----------
  const etapa = ref("carregando");
  const mensagemErro = ref("");

  const questoes = ref([]);
  const indiceAtual = ref(0);
  const respostaDada = ref(null); // "C", "E" ou null

  const acertos = ref(0);
  const erros = ref(0);

  const topicosPorId = ref(new Map());

  // ---------- Valores derivados (computed) ----------
  const questaoAtual = computed(() => questoes.value[indiceAtual.value]);

  const acertou = computed(
    () => respostaDada.value === questaoAtual.value?.gabarito
  );

  const ehUltimaQuestao = computed(
    () => indiceAtual.value === questoes.value.length - 1
  );

  // No Cebraspe, cada erro anula um acerto.
  const notaLiquida = computed(() => acertos.value - erros.value);

  /** Disciplina (nível 2) e tópico da questão atual, para dar contexto. */
  const topicoAtual = computed(() => {
    const id = questaoAtual.value?.topicoId;
    const topico = id && topicosPorId.value.get(id);
    if (!topico) return null;

    const idDisciplina = id.split(".").slice(0, 2).join(".");
    const disciplina = topicosPorId.value.get(idDisciplina);

    return {
      id: topico.id,
      titulo: topico.titulo,
      disciplina: disciplina && disciplina !== topico ? disciplina.titulo : "",
    };
  });

  // ---------- Ações ----------
  async function carregar() {
    etapa.value = "carregando";
    mensagemErro.value = "";

    try {
      // As duas buscas são independentes, então rodam em paralelo.
      const [listaQuestoes, conteudo] = await Promise.all([
        buscarQuestoes(),
        buscarConteudo(),
      ]);

      topicosPorId.value = new Map(conteudo.map((t) => [t.id, t]));
      questoes.value = embaralhar(listaQuestoes);
      reiniciarPlacar();

      etapa.value = questoes.value.length > 0 ? "respondendo" : "vazio";
    } catch (erro) {
      mensagemErro.value = erro.message;
      etapa.value = "erro";
    }
  }

  function responder(opcao) {
    if (etapa.value !== "respondendo") return; // evita responder duas vezes

    respostaDada.value = opcao;
    if (acertou.value) acertos.value++;
    else erros.value++;

    etapa.value = "corrigida";
  }

  function proxima() {
    if (etapa.value !== "corrigida") return;

    if (ehUltimaQuestao.value) {
      etapa.value = "fim";
      return;
    }

    indiceAtual.value++;
    respostaDada.value = null;
    etapa.value = "respondendo";
  }

  function recomecar() {
    questoes.value = embaralhar(questoes.value);
    reiniciarPlacar();
    etapa.value = "respondendo";
  }

  function reiniciarPlacar() {
    indiceAtual.value = 0;
    respostaDada.value = null;
    acertos.value = 0;
    erros.value = 0;
  }

  // Tudo o que o componente pode usar:
  return {
    etapa,
    mensagemErro,
    questoes,
    indiceAtual,
    questaoAtual,
    respostaDada,
    acertou,
    ehUltimaQuestao,
    acertos,
    erros,
    notaLiquida,
    topicoAtual,
    carregar,
    responder,
    proxima,
    recomecar,
  };
}

/** Embaralhamento de Fisher-Yates: devolve uma cópia em ordem aleatória. */
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
