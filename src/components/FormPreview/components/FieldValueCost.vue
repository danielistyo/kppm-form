<template>
  <table class="field-value-cost">
    <thead>
      <th>Komponen</th>
      <th>Banyaknya</th>
      <th>Harga Satuan</th>
      <th>Jumlah</th>
    </thead>
    <tbody>
      <tr v-for="(item, index) in value" :key="index">
        <td>{{ item.name }}</td>
        <td>{{ item.count }}</td>
        <td class="field-value-cost__money">{{ item.price }}</td>
        <td class="field-value-cost__money">{{ item.price * item.count }}</td>
      </tr>
      <tr>
        <td colspan="3">Total</td>
        <td class="field-value-cost__money">{{ totalPrice }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { FieldCostValue } from '@/types';

declare type ValueProp = Array<FieldCostValue>;

export default defineComponent({
  name: 'FieldValueCost',
  props: {
    value: {
      type: Array as PropType<ValueProp>,
      required: true,
    },
  },
  setup(props) {
    const totalPrice = computed(() =>
      props.value.reduce((total: number, item: FieldCostValue): number => {
        return total + item.price * item.count;
      }, 0),
    );
    return { totalPrice };
  },
});
</script>
