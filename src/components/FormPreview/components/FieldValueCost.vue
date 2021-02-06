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
