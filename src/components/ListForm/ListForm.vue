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
      v-for="(unit, index) in list"
      :key="index"
      @click="$emit('selected', unit.key)"
      class="p-mb-2 unit-list"
    >
      <template #content>
        <div>
          <div class="unit-list__number">{{ unit.nomor_program }}</div>
          <div class="unit-list__name">{{ unit.nama_program }}</div>
          <div class="unit-list__created">
            <i class="pi pi-calendar" /> {{ convertToDate(unit.key) }}
          </div>
          <i class="unit-list__icon-right pi pi-angle-right" />
        </div>
      </template>
    </card>
  </div>
</template>

<script lang="ts">
import ButtonPrime from 'primevue/button';
import Card from 'primevue/card';
import dayjs from 'dayjs';

export default {
  name: 'ListForm',
  components: {
    Card,
    ButtonPrime,
  },
  emits: ['selected', 'addclick'],
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const convertToDate = (key: string) => {
      const splittedKey = key.split('-');
      const timestamp: number = parseInt(splittedKey[splittedKey.length - 1]);

      return dayjs.unix(timestamp).format('DD-MM-YYYY HH:ss');
    };
    return { convertToDate };
  },
};
</script>

<style src="./ListForm.scss" lang="scss" scoped></style>
