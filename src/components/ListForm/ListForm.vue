<template>
  <div class="list-form">
    <div class="p-text-right">
      <button-prime
        @click="$emit('addclick')"
        icon="pi pi-plus"
        class="p-button-primary p-button-sm p-mb-2"
        label="Tambah"
      />
    </div>
    <card
      v-for="(unit, index) in paginatedList"
      :key="index"
      @click="$emit('selected', unit.key)"
      class="p-mb-2 unit-list"
    >
      <template #content>
        <div>
          <div class="unit-list__number">{{ unit.nomor_program }}</div>
          <div class="unit-list__name">{{ unit.nama_program }}</div>
          <div class="unit-list__created">
            <i class="pi pi-calendar" />
            {{ convertToDate(unit.created_at) }}
          </div>
          <i class="unit-list__icon-right pi pi-angle-right" />
        </div>
      </template>
    </card>
    <paginator
      @page="handlePageChange"
      :totalRecords="list.length"
      :rows="5"
      template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    />
  </div>
</template>

<script lang="ts">
import ButtonPrime from 'primevue/button';
import Paginator from 'primevue/paginator';
import Card from 'primevue/card';
import dayjs from 'dayjs';
import { ref, unref } from '@vue/reactivity';
import { computed, defineComponent } from '@vue/runtime-core';

export default defineComponent({
  name: 'ListForm',
  components: {
    Card,
    ButtonPrime,
    Paginator,
  },
  emits: ['selected', 'addclick'],
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const convertToDate = (timestamp: number) => {
      return dayjs.unix(timestamp).format('DD-MM-YYYY HH:mm');
    };

    const page = ref(0);
    const paginatedList = computed(() => {
      return props.list.slice(unref(page), unref(page) + 5);
    });

    const handlePageChange = ($event: {
      page: number;
      first: number;
      rows: number;
      pageCount: number;
    }) => {
      page.value = $event.page;
    };

    return { convertToDate, handlePageChange, paginatedList };
  },
});
</script>

<style src="./ListForm.scss" lang="scss" scoped></style>
