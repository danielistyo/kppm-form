<template>
  <div class="form-preview">
    <div class="form-preview__paper">
      <div class="form-preview__header header">
        <img :src="`/img/gkjw.jpg`" class="header__logo" />
        <div class="header__title">
          GREJA KRISTEN JAWI WETAN<br />
          Jemaat Rungkut – Surabaya<br />
          FORM {{ type.toUpperCase() }}3
        </div>
      </div>

      <h3 class="form-preview__title">
        FORM {{ title }} KEGIATAN PEMBANGUNAN<br />
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
          <!-- row for field which doesn't have children -->
          <tr v-if="!field.children">
            <td>{{ index + 1 }}</td>
            <td>{{ field.name }}</td>
            <td colspan="2">
              <component
                :is="field.fieldValue"
                :value="field.value"
                :view="field.view"
                :need-render="field.type === 'simple-editor'"
              />
            </td>
          </tr>
          <!-- row for field which has children -->
          <tr
            v-else-if="field.children"
            v-for="(child, childIdx) in field.children"
            :key="childIdx"
          >
            <td v-show="childIdx === 0" :rowspan="field.children.length">{{ index + 1 }}</td>
            <td v-show="childIdx === 0" :rowspan="field.children.length">{{ field.name }}</td>
            <td>{{ child.name }}</td>
            <td>
              <component :is="child.fieldValue" :value="child.value" />
            </td>
          </tr>
        </template>
      </table>

      <div class="form-preview__footer">
        <div class="form-preview__approver approver">
          <br />
          <div>Menyetujui</div>
          <div>Ketua Bidang .............................</div>
          <div class="approver__sign"></div>
        </div>
        <div class="form-preview__requester requester">
          <div>Surabaya, ..............................</div>
          <div>Ketua Komisi/Panitia/Tim</div>
          <br />
          <div class="requester__sign"></div>
        </div>
        <div class="form-preview__approver-note">
          Catatan Ketua Bidang/PHMJ
          <div class="form-preview__approver-note-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FormFields, FormlKeys, FormpKeys } from '@/types';
import { computed, ComputedRef, defineComponent, PropType } from 'vue';
import FieldValueCost from './components/FieldValueCost.vue';
import FieldValueDefault from './components/FieldValueDefault.vue';
import FieldValueSourceFund from './components/FieldValueSourceFund.vue';

type FieldType = FormFields<FormpKeys | FormlKeys>;
type ComputedFieldType = ComputedRef<FieldType>;

export default defineComponent({
  name: 'FormPreview',
  components: {
    FieldValueCost,
    FieldValueDefault,
    FieldValueSourceFund,
  },
  props: {
    inputs: {
      type: Array as PropType<FieldType>,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const topTableFields: ComputedFieldType = computed<FieldType>(() => props.inputs.slice(0, 2));

    const mainTableFields: ComputedFieldType = computed<FieldType>(() => props.inputs.slice(2));

    const title = computed<string>(() =>
      props.type === 'l' ? 'LAPORAN' : 'PENGAJUAN PELAKSANAAN',
    );
    return { topTableFields, mainTableFields, title };
  },
});
</script>

<style lang="scss" src="./FormPreview.scss" scoped></style>
