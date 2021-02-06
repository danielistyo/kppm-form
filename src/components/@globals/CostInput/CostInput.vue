<template>
  <div class="cost-input">
    <div class="p-d-flex cost-input__titles">
      <span style="width:100%" class="p-mr-2 p-text-center">Nama</span>
      <span style="width:10em" class="p-mr-2 p-text-center">Jumlah</span>
      <span style="width:100%" class="p-text-center">Harga</span>
    </div>
    <template v-for="(child, index) in computedValue" :key="index">
      <input-group
        v-model:name="computedValue[index].name"
        v-model:count="computedValue[index].count"
        v-model:price="computedValue[index].price"
        @delete="handleDeleteClicked(index)"
      />
    </template>
    <pr-button @click="handleAddClicked" label="Tambah" class="p-button-sm cost-input__add" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import PrButton from 'primevue/button';
import InputGroup from './components/InputGroup.vue';
import { CostItem, CostItems } from '@/types';

interface Props {
  modelValue: CostItems;
}

export default defineComponent({
  name: 'CostInput',
  components: {
    InputGroup,
    PrButton,
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
  },
  setup(props: Readonly<Props>, { emit }) {
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
      const costItems = props.modelValue.concat(costItem);
      emit('update:modelValue', costItems);
    };

    const handleDeleteClicked = (selectedIndex: number): void => {
      const costItems = props.modelValue.filter((obj, costIndex) => {
        console.log(selectedIndex, costIndex);
        return costIndex !== selectedIndex;
      });
      emit('update:modelValue', costItems);
    };
    return { computedValue, handleAddClicked, handleDeleteClicked };
  },
});
</script>

<style src="./CostInput.scss" lang="scss" scoped></style>
