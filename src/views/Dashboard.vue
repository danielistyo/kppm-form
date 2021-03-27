<template>
  <div class="dashboard">
    <h2>Selamat datang, {{ name }}</h2>
  </div>
</template>

<script lang="ts">
import { RootStateStoreWithModule } from '@/types';
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const store = useStore<RootStateStoreWithModule>();
    const name = computed(() => {
      return store.state.auth.name;
    });

    return { name };
  },
});
</script>

<style lang="scss" scoped>
.dashboard {
  max-width: 768px;
  margin: auto;
}
</style>
