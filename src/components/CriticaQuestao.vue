<script setup>
import { computed } from "vue";

// Mostra o resultado da resposta e a crítica (comentário) da questão.
const props = defineProps({
  acertou: { type: Boolean, required: true },
  gabarito: { type: String, required: true }, // "C" ou "E"
  comentario: { type: String, default: "" },
  ehUltimaQuestao: { type: Boolean, default: false },
});

const emit = defineEmits(["proxima"]);

const gabaritoPorExtenso = computed(() =>
  props.gabarito === "C" ? "Certo" : "Errado"
);
</script>

<template>
  <section class="critica" :class="acertou ? 'certo' : 'errado'" aria-live="polite">
    <h2>{{ acertou ? "Você acertou!" : "Você errou." }}</h2>
    <p>Gabarito: <strong>{{ gabaritoPorExtenso }}</strong></p>

    <p v-if="comentario" class="comentario">{{ comentario }}</p>
    <p v-else class="comentario sem-comentario">Esta questão ainda não tem comentário.</p>

    <button type="button" class="botao-principal" @click="emit('proxima')">
      {{ ehUltimaQuestao ? "Ver resultado" : "Próxima questão" }} <kbd>Enter</kbd>
    </button>
  </section>
</template>
