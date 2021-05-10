<template>
  <div class="dashboard">
    <h2 class="p-py-5">Selamat datang, {{ name }}</h2>
    <div class="p-grid">
      <card class="p-col p-mr-2 p-ml-2 p-mb-2">
        <template #title>Form P</template>
        <template #content>
          <div class="card-statistic">
            <div class="card-statistic__item">
              {{ formpCount.draft }}
              <div class="card-statistic__label">Draft</div>
            </div>
            <div class="card-statistic__item">
              {{ formpCount.waiting }}
              <div class="card-statistic__label">Pengajuan</div>
            </div>
            <div class="card-statistic__item">
              {{ formpCount.done }}
              <div class="card-statistic__label">Selesai</div>
            </div>
          </div>
        </template>
      </card>
      <card class="p-col p-ml-2 p-mr-2 p-mb-2">
        <template #title>Form L</template>
        <template #content>
          <div class="card-statistic">
            <div class="card-statistic__item">
              {{ formlCount.draft }}
              <div class="card-statistic__label">Draft</div>
            </div>
            <div class="card-statistic__item">
              {{ formlCount.waiting }}
              <div class="card-statistic__label">Pengajuan</div>
            </div>
            <div class="card-statistic__item">
              {{ formlCount.done }}
              <div class="card-statistic__label">Selesai</div>
            </div>
          </div>
        </template>
      </card>
    </div>
  </div>
</template>

<script lang="ts">
import Card from 'primevue/card';
import { RootStateStore } from '@/types';
import { computed, defineComponent } from 'vue';
import { mapGetters, useStore } from 'vuex';

export default defineComponent({
  name: 'Dashboard',
  components: {
    Card,
  },
  setup() {
    const store = useStore<RootStateStore>();
    const name = computed(() => {
      return store.state.auth.name;
    });

    return { name };
  },
  computed: {
    ...mapGetters({ formpCount: 'formp/statusCount', formlCount: 'forml/statusCount' }),
  },
});
</script>

<style lang="scss" scoped>
.dashboard {
  max-width: 768px;
  margin: auto;
}

.card-statistic {
  display: flex;
  justify-content: space-between;

  &__item {
    margin: 0 10px;
    font-size: 24px;
    text-align: center;
  }

  &__label {
    font-size: 16px;
  }
}
</style>
