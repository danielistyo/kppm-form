<template>
  <main-header />
  <main-sidebar v-model:visible="showSidebar" />
  <confirm-dialog />
  <div class="main-container"><router-view /></div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import MainSidebar from './components/MainSidebar/MainSidebar.vue';
import MainHeader from './components/MainHeader/MainHeader.vue';
import emitter from '@/emitter';

export default defineComponent({
  name: 'App',
  components: {
    ConfirmDialog,
    MainSidebar,
    MainHeader,
  },
  setup() {
    const showSidebar = ref(false);
    emitter.on('sidebar:show', (isShow) => {
      showSidebar.value = isShow;
    });
    return { showSidebar };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  margin-top: 62px;
}
</style>
