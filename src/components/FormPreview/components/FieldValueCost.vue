<template>
  <div>
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
          <td class="field-value-cost__money">{{ formatIDR(item.price * item.count) }}</td>
        </tr>
        <tr>
          <td colspan="3">Total</td>
          <td class="field-value-cost__money">{{ totalPrice }}</td>
        </tr>
      </tbody>
    </table>
    <h4 v-if="type === 'l'" class="p-mb-0 p-mt-1">
      Sumber Dana - Biaya = {{ formatIDR(remainingBalance) }}
    </h4>
  </div>
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
    type: {
      type: String as PropType<'l' | 'p'>,
      required: true,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const formatIDR = (number: number) => {
      return new Intl.NumberFormat('id', { style: 'currency', currency: 'IDR' }).format(number);
    };
    const totalPrice = computed(() => {
      const number = props.value.reduce((total: number, item: FieldCostValue): number => {
        return total + item.price * item.count;
      }, 0);
      return formatIDR(number);
    });
    return { totalPrice, formatIDR };
  },
});
</script>
