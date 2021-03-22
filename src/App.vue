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
import { useStore } from 'vuex';
import { RootStateStoreWithModule } from './types';

export default defineComponent({
  name: 'App',
  components: {
    ConfirmDialog,
    MainSidebar,
    MainHeader,
  },
  setup() {
    const store = useStore<RootStateStoreWithModule>();
    store.dispatch('pkt/getPkt');
    store.dispatch('formp/getFormp');
    store.dispatch('forml/getForml');

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
