<template>
  <prime-sidebar visible position="left"></prime-sidebar>
</template>

<script>
import { defineComponent } from 'vue';
import PrimeSidebar from 'primevue/sidebar';

export default defineComponent({
  name: 'MainSidebar',
  components: {
    PrimeSidebar,
  },
});
</script>

<style src="./MainSidebar.scss" lang="scss" scoped></style>
