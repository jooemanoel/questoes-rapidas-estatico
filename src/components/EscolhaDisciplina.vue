<script setup>
// Tela inicial: lista os itens do edital e suas disciplinas para escolher o que estudar.
// Só exibe as opções e emite "escolher" com o id do tópico (null = todas).
defineProps({
  // [{ id, titulo, total, disciplinas: [{ id, titulo, total }] }]
  grupos: { type: Array, required: true },
  totalGeral: { type: Number, required: true },
  totalRespondidas: { type: Number, default: 0 },
});

const emit = defineEmits(["escolher", "apagar-historico"]);

function confirmarApagarHistorico() {
  if (confirm("Esquecer todas as questões já respondidas neste navegador?")) {
    emit("apagar-historico");
  }
}

/** "CONHECIMENTOS ESPECÍFICOS - CARGO 4: ..." vira "CONHECIMENTOS ESPECÍFICOS". */
function tituloCurto(titulo) {
  return titulo.split(" - ")[0];
}
</script>

<template>
  <section class="escolha">
    <h2>O que você quer estudar?</h2>

    <p v-if="totalRespondidas > 0" class="detalhe historico">
      Você já respondeu {{ totalRespondidas }} de {{ totalGeral }} questões.
      As ainda não respondidas aparecem primeiro.
      <button type="button" class="botao-link" @click="confirmarApagarHistorico">
        Limpar histórico
      </button>
    </p>

    <button type="button" class="opcao-estudo todas" @click="emit('escolher', null)">
      <span>Todas as disciplinas</span>
      <span class="contagem">{{ totalGeral }}</span>
    </button>

    <div v-for="grupo in grupos" :key="grupo.id" class="grupo">
      <button type="button" class="opcao-estudo grupo-titulo" @click="emit('escolher', grupo.id)">
        <span>{{ grupo.id }} {{ tituloCurto(grupo.titulo) }}</span>
        <span class="contagem">{{ grupo.total }}</span>
      </button>

      <ul>
        <li v-for="disciplina in grupo.disciplinas" :key="disciplina.id">
          <button type="button" class="opcao-estudo" @click="emit('escolher', disciplina.id)">
            <span><strong>{{ disciplina.id }}</strong> {{ disciplina.titulo }}</span>
            <span class="contagem">{{ disciplina.total }}</span>
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
