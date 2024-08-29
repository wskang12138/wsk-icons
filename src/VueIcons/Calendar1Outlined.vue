
<template>
  <svg xmlns="http://www.w3.org/2000/svg" v-html="icon" />
</template>

<script setup>
import { ref } from 'vue';

const icon = `<svg viewBox="0 0 16 16" fill="currentColor" width="1em" height="1em" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M14.667 16H1.333A1.31 1.31 0 0 1 0 14.72V3.2a1.31 1.31 0 0 1 1.333-1.28H4V0h1.333v1.92h5.334V0H12v1.92h2.666A1.31 1.31 0 0 1 16 3.2v11.52A1.31 1.31 0 0 1 14.667 16M1.333 7.04v7.68h13.334V7.04Zm0-3.84v2.56h13.334V3.2H12v1.28h-1.333V3.2H5.333v1.28H4V3.2Z"/>
  <path fill="none" d="M0 0h16v16H0z" data-name="矩形 532"/>
</svg>
`;
</script>

<style scoped>
svg {
  width: 1em;
  height: 1em;
}
</style>
    