<template>
  <confirm-dialog />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';

export default defineComponent({
  name: 'App',
  components: {
    ConfirmDialog,
  },
  data: () => ({
    //
  }),
});
</script>
