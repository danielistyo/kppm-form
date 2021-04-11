<template>
  <div class="list-form">
    <div class="list-form__header">
      <pkt-dropdown
        v-model="selectedPktKey"
        placeholder="Cari berdasarkan PKT"
        class="list-form__pkt-dropdown"
        show-all-option
      />
      <button-prime
        @click="$emit('addclick')"
        icon="pi pi-plus"
        class="p-button-primary list-form__add"
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
          <div class="unit-list__creator">
            <i class="pi pi-user" />
            {{ unit.creator_name }}
          </div>
          <i class="unit-list__icon-right pi pi-angle-right" />
        </div>
      </template>
    </card>
    <paginator
      @page="handlePageChange"
      :totalRecords="totalRecords"
      :rows="perPage"
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
import { computed, defineComponent, PropType, watchEffect } from '@vue/runtime-core';
import PktDropdown from '@/components/@globals/PktDropdown';
import { ListFormpItem } from '@/types';
import firebase from 'firebase/app';

export default defineComponent({
  name: 'ListForm',
  components: {
    Card,
    ButtonPrime,
    Paginator,
    PktDropdown,
  },
  emits: ['selected', 'addclick'],
  props: {
    list: {
      type: Array as PropType<ListFormpItem>,
      required: true,
    },
  },
  setup(props) {
    const selectedPktKey = ref<string | null>(null);

    const convertToDate = (timestamp: number) => {
      return dayjs.unix(timestamp).format('DD-MM-YYYY HH:mm');
    };

    const perPage = ref(10);
    const page = ref(0);
    const filteredList = computed<ListFormpItem>(() => {
      if (unref(selectedPktKey)) {
        return props.list.filter((unit) => {
          return unit.pkt === unref(selectedPktKey);
        });
      }
      return props.list;
    });

    const paginatedList = computed(() => {
      let generatedList = props.list;
      if (unref(selectedPktKey)) {
        generatedList = unref(filteredList);
      }
      return generatedList.slice(unref(page), unref(page) + unref(perPage));
    });

    const getCreatorName = () => {
      unref(paginatedList).forEach((unit) => {
        firebase
          .database()
          .ref('users/' + unit.creator_id)
          .once('value', (snapshot) => {
            unit.creator_name = snapshot.val().name;
          });
      });
    };

    watchEffect(() => {
      if (unref(paginatedList)) {
        getCreatorName();
      }
    });

    const totalRecords = computed<number>(() => {
      return unref(filteredList).length;
    });

    const handlePageChange = ($event: {
      page: number;
      first: number;
      rows: number;
      pageCount: number;
    }) => {
      page.value = $event.page;
    };

    getCreatorName();

    return {
      convertToDate,
      handlePageChange,
      paginatedList,
      selectedPktKey,
      totalRecords,
      perPage,
    };
  },
});
</script>

<style src="./ListForm.scss" lang="scss" scoped></style>
