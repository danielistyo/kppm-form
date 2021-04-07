<template>
  <div class="cost-input">
    <div class="p-d-flex cost-input__titles">
      <span style="width:33.2941176%" class="p-mr-2 p-text-center">Nama</span>
      <span style="width:14.7058824%" class="p-mr-2 p-text-center">Satuan</span>
      <span v-if="useFrequency" style="width:14.7058824%" class="p-mr-2 p-text-center">
        Frekuensi
      </span>
      <span style="width:35.2941176%" class="p-text-center">Harga</span>
    </div>
    <template v-for="(child, index) in computedValue" :key="index">
      <input-group
        v-model:name="computedValue[index].name"
        v-model:count="computedValue[index].count"
        v-model:price="computedValue[index].price"
        v-model:frequency="computedValue[index].frequency"
        :use-frequency="useFrequency"
        @delete="handleDeleteClicked(index)"
      />
    </template>
    <pr-button @click="handleAddClicked" label="Tambah" class="p-button-sm cost-input__add" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import PrButton from 'primevue/button';
import InputGroup from './components/InputGroup.vue';
import { CostItem, CostItems } from '@/types';

export default defineComponent({
  name: 'CostInput',
  components: {
    InputGroup,
    PrButton,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array as PropType<CostItems>,
      required: true,
    },
    useFrequency: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const computedValue = computed<CostItems>({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', val);
      },
    });

    const handleAddClicked = (): void => {
      const costItem: CostItem = { name: '', count: 0, price: 0 };
      if (props.useFrequency) costItem.frequency = 0;
      const costItems = props.modelValue.concat(costItem);
      emit('update:modelValue', costItems);
    };

    const handleDeleteClicked = (selectedIndex: number): void => {
      const costItems = props.modelValue.filter((obj, costIndex) => {
        return costIndex !== selectedIndex;
      });
      emit('update:modelValue', costItems);
    };
    return { computedValue, handleAddClicked, handleDeleteClicked };
  },
});
</script>

<style src="./CostInput.scss" lang="scss" scoped></style>
