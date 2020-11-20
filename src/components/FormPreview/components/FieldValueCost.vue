<template>
  <table class="field-value-cost">
    <thead>
      <th>Komponen</th>
      <th>Banyaknya</th>
      <th>Harga Satuan</th>
      <th>Jumlah</th>
    </thead>
    <tbody>
      <tr>
        <td>Minuman</td>
        <td>3</td>
        <td class="field-value-cost__money">10000</td>
        <td class="field-value-cost__money">30000</td>
      </tr>
      <tr>
        <td>Minuman</td>
        <td>3</td>
        <td class="field-value-cost__money">10000</td>
        <td class="field-value-cost__money">30000</td>
      </tr>
      <tr>
        <td colspan="3">Total</td>
        <td class="field-value-cost__money">60000</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FieldValueCost',
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
});
</script>
