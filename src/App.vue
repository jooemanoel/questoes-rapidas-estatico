<script setup>
// Componente raiz: liga o estado (composable) aos componentes de tela.
import { onMounted, onUnmounted } from "vue";
import { useQuestionario } from "./composables/useQuestionario.js";
import PlacarSessao from "./components/PlacarSessao.vue";
import QuestaoItem from "./components/QuestaoItem.vue";
import CriticaQuestao from "./components/CriticaQuestao.vue";

const {
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
} = useQuestionario();

// Atalhos de teclado: C = Certo, E = Errado, Enter = próxima.
function aoPressionarTecla(evento) {
  const tecla = evento.key.toLowerCase();

  if (etapa.value === "respondendo" && tecla === "c") responder("C");
  else if (etapa.value === "respondendo" && tecla === "e") responder("E");
  else if (etapa.value === "corrigida" && tecla === "enter") {
    evento.preventDefault(); // evita "clicar" de novo no botão em foco
    proxima();
  }
}

onMounted(() => {
  carregar();
  window.addEventListener("keydown", aoPressionarTecla);
});

// Sempre remova os ouvintes globais ao desmontar o componente.
onUnmounted(() => {
  window.removeEventListener("keydown", aoPressionarTecla);
});
</script>

<template>
  <main class="pagina">
    <header class="cabecalho">
      <h1>Questões Rápidas</h1>
      <PlacarSessao
        v-if="questoes.length"
        :acertos="acertos"
        :erros="erros"
        :nota-liquida="notaLiquida"
      />
    </header>

    <!-- Cada bloco abaixo corresponde a uma etapa do questionário -->

    <p v-if="etapa === 'carregando'" class="aviso">Carregando questões…</p>

    <section v-else-if="etapa === 'erro'" class="aviso erro">
      <p>Não foi possível carregar as questões.</p>
      <p class="detalhe">{{ mensagemErro }}</p>
      <button type="button" class="botao-principal" @click="carregar">Tentar de novo</button>
    </section>

    <p v-else-if="etapa === 'vazio'" class="aviso">
      Nenhuma questão cadastrada ainda.
    </p>

    <template v-else-if="etapa === 'respondendo' || etapa === 'corrigida'">
      <p class="progresso">Questão {{ indiceAtual + 1 }} de {{ questoes.length }}</p>

      <QuestaoItem
        :questao="questaoAtual"
        :topico="topicoAtual"
        :resposta-dada="respostaDada"
        :bloqueada="etapa === 'corrigida'"
        @responder="responder"
      />

      <CriticaQuestao
        v-if="etapa === 'corrigida'"
        :acertou="acertou"
        :gabarito="questaoAtual.gabarito"
        :comentario="questaoAtual.comentario"
        :eh-ultima-questao="ehUltimaQuestao"
        @proxima="proxima"
      />
    </template>

    <section v-else-if="etapa === 'fim'" class="aviso fim">
      <h2>Sessão concluída</h2>
      <p>
        Você respondeu {{ questoes.length }} questões:
        {{ acertos }} acertos e {{ erros }} erros (nota líquida {{ notaLiquida }}).
      </p>
      <button type="button" class="botao-principal" @click="recomecar">Recomeçar</button>
    </section>
  </main>
</template>
