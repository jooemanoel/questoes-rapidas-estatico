<script setup>
// Componente de exibição: só recebe dados (props) e mostra.
defineProps({
  acertos: { type: Number, required: true },
  erros: { type: Number, required: true },
  notaLiquida: { type: Number, required: true },
});
</script>

<template>
  <dl class="placar">
    <div>
      <dt>Acertos</dt>
      <dd class="certo">{{ acertos }}</dd>
    </div>
    <div>
      <dt>Erros</dt>
      <dd class="errado">{{ erros }}</dd>
    </div>
    <div title="Acertos menos erros, como no Cebraspe">
      <dt>Nota líquida</dt>
      <dd>{{ notaLiquida }}</dd>
    </div>
  </dl>
</template>
