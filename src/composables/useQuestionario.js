// Composable: reúne o estado e as regras da sessão de estudo.
// Os componentes só exibem dados e avisam o que o usuário fez;
// quem decide o que acontece em seguida é este arquivo.

import { ref, computed } from "vue";
import { buscarQuestoes, buscarConteudo } from "../services/api.js";

/**
 * A tela está sempre em UMA destas etapas:
 *   "carregando"  -> buscando dados na API
 *   "erro"        -> a busca falhou
 *   "escolhendo"  -> tela inicial: escolha da disciplina
 *   "vazio"       -> a disciplina escolhida não tem questões
 *   "respondendo" -> questão na tela, aguardando Certo/Errado
 *   "corrigida"   -> resposta dada, crítica visível
 *   "fim"         -> todas as questões da sessão respondidas
 */
export function useQuestionario() {
  // ---------- Estado ----------
  const etapa = ref("carregando");
  const mensagemErro = ref("");

  const todasQuestoes = ref([]); // tudo o que veio da API
  const questoes = ref([]); // só as da disciplina escolhida, embaralhadas
  const filtroAtual = ref(null); // id do tópico escolhido (null = todas)

  const indiceAtual = ref(0);
  const respostaDada = ref(null); // "C", "E" ou null

  const acertos = ref(0);
  const erros = ref(0);

  const topicos = ref([]); // lista plana do conteudo.json
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

  /**
   * Opções da tela inicial: cada item do edital (nível 1) com suas
   * disciplinas (nível 2) e a quantidade de questões de cada um.
   * Itens sem nenhuma questão não aparecem.
   */
  const opcoesDeEstudo = computed(() =>
    topicos.value
      .filter((t) => t.nivel === 1)
      .map((grupo) => ({
        id: grupo.id,
        titulo: grupo.titulo,
        total: contarQuestoes(grupo.id),
        disciplinas: topicos.value
          .filter((t) => t.parentId === grupo.id)
          .map((d) => ({ id: d.id, titulo: d.titulo, total: contarQuestoes(d.id) }))
          .filter((d) => d.total > 0),
      }))
      .filter((grupo) => grupo.total > 0)
  );

  /** Nome do filtro em uso, exibido durante a sessão. */
  const rotuloFiltro = computed(() => {
    if (!filtroAtual.value) return "Todas as disciplinas";
    const topico = topicosPorId.value.get(filtroAtual.value);
    return topico ? `${topico.id} ${topico.titulo}` : filtroAtual.value;
  });

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

      topicos.value = conteudo;
      topicosPorId.value = new Map(conteudo.map((t) => [t.id, t]));
      todasQuestoes.value = listaQuestoes;

      etapa.value = "escolhendo";
    } catch (erro) {
      mensagemErro.value = erro.message;
      etapa.value = "erro";
    }
  }

  /** Inicia uma sessão com as questões do tópico escolhido (null = todas). */
  function iniciar(idTopico) {
    filtroAtual.value = idTopico;
    questoes.value = embaralhar(
      todasQuestoes.value.filter((q) => pertenceAo(q, idTopico))
    );
    reiniciarPlacar();
    etapa.value = questoes.value.length > 0 ? "respondendo" : "vazio";
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

  /** Repete a mesma disciplina, em nova ordem. */
  function recomecar() {
    iniciar(filtroAtual.value);
  }

  /** Volta para a tela inicial de escolha. */
  function trocarDisciplina() {
    etapa.value = "escolhendo";
  }

  function reiniciarPlacar() {
    indiceAtual.value = 0;
    respostaDada.value = null;
    acertos.value = 0;
    erros.value = 0;
  }

  // ---------- Funções auxiliares ----------

  /** A questão pertence ao tópico se o topicoId é ele ou um descendente (ex.: "3.2" inclui "3.2.1.4"). */
  function pertenceAo(questao, idTopico) {
    if (!idTopico) return true;
    const id = questao.topicoId || "";
    return id === idTopico || id.startsWith(`${idTopico}.`);
  }

  function contarQuestoes(idTopico) {
    return todasQuestoes.value.filter((q) => pertenceAo(q, idTopico)).length;
  }

  // Tudo o que o componente pode usar:
  return {
    etapa,
    mensagemErro,
    todasQuestoes,
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
    opcoesDeEstudo,
    rotuloFiltro,
    carregar,
    iniciar,
    responder,
    proxima,
    recomecar,
    trocarDisciplina,
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
