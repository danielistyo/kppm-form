<template>
  <div class="p-d-inline-flex p-mb-2 p-ai-center">
    <input-text v-model="computedName" class="p-mr-2 p-p-1" />
    <input-number v-model="computedCount" style="width:10em" class="p-mr-2" inputClass="p-p-1" />
    <input-number
      v-model="computedPrice"
      mode="currency"
      currency="IDR"
      locale="id-ID"
      class="p-mr-2"
      inputClass="p-p-1"
    />
    <i @click="handleDelete" class="pi pi-times"></i>
  </div>
</template>

<script lang="ts">
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import { computed, defineComponent, WritableComputedOptions } from 'vue';
import { CostItem } from '@/types';

export default defineComponent({
  name: 'InputGroup',
  components: {
    InputText,
    InputNumber,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  setup(props: Readonly<CostItem>, { emit }) {
    const computedName = computed({
      get() {
        return props.name;
      },
      set(val) {
        emit(`update:name`, val);
      },
    });
    const computedCount = computed({
      get() {
        return props.count;
      },
      set(val) {
        emit(`update:count`, val);
      },
    });
    const computedPrice = computed({
      get() {
        return props.price;
      },
      set(val) {
        emit(`update:price`, val);
      },
    });

    const handleDelete = () => {
      emit('delete');
    };

    return {
      computedName,
      computedCount,
      computedPrice,
      handleDelete,
    };
  },
});
</script>
