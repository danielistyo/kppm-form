<template>
  <div class="form-preview">
    <div class="form-preview__paper">
      <div class="form-preview__header header">
        <img :src="`/img/gkjw.jpg`" class="header__logo" />
        <div class="header__title">
          GREJA KRISTEN JAWI WETAN<br />
          Jemaat Rungkut – Surabaya<br />
          FORM L3
        </div>
      </div>

      <h3 class="form-preview__title">
        FORM LAPORAN KEGIATAN PEMBANGUNAN<br />
        PASAL 300 DAN 700
      </h3>

      <table class="form-preview__top-table">
        <tr v-for="(field, index) in topTableFields" :key="index">
          <td>{{ field.name }}</td>
          <td>:</td>
          <td>{{ field.value }}</td>
        </tr>
      </table>

      <table class="form-preview__main-table">
        <template v-for="(field, index) in mainTableFields" :key="index">
          <tr v-if="!field.children">
            <td>{{ index + 1 }}</td>
            <td>{{ field.name }}</td>
            <td colspan="2">
              <component :is="field.fieldValue" :value="field.value" :view="field.view" />
            </td>
          </tr>
          <tr
            v-else-if="field.children"
            v-for="(child, childIdx) in field.children"
            :key="childIdx"
          >
            <td v-show="childIdx === 0" :rowspan="field.children.length">{{ index + 1 }}</td>
            <td v-show="childIdx === 0" :rowspan="field.children.length">{{ field.name }}</td>
            <td>{{ child.name }}</td>
            <td>{{ child.value }}</td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { FormLFields } from '@/types';
import { FIELD_BIAYA_ID } from '@/constants';
import { computed, ComputedRef } from 'vue';
import { useStore } from 'vuex';
import FieldValueCost from './components/FieldValueCost.vue';
import FieldValueDefault from './components/FieldValueDefault.vue';

export default {
  name: 'FormPreview',
  components: {
    FieldValueCost,
    FieldValueDefault,
  },
  setup() {
    const store = useStore();
    const topTableFields: ComputedRef<FormLFields> = computed<FormLFields>(() =>
      store.state.forml.fields.slice(0, 2),
    );
    const mainTableFields: ComputedRef<FormLFields> = computed<FormLFields>(() =>
      store.state.forml.fields.slice(2),
    );
    return { topTableFields, mainTableFields, FIELD_BIAYA_ID };
  },
};
</script>

<style lang="scss" src="./FormPreview.scss" scoped></style>
