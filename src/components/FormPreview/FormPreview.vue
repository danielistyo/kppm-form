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
          <td>{{ getValue(field.value) }}</td>
        </tr>
      </table>

      <table class="form-preview__main-table">
        <template v-for="(field, index) in mainTableFields" :key="index">
          <!-- 
            TODO: need to create new component to handle table row. 
            ex: TableRowDefault, TableRowCost, etc 
          -->
          <!-- row for field which doesn't have children -->
          <tr v-if="!field.children">
            <td>{{ index + 1 }}</td>
            <td>{{ field.name }}</td>
            <td colspan="2">
              <component
                :is="field.fieldValue"
                :value="field.value"
                :view="field.view"
                :type="type"
                :remaining-balance="remainingBalance"
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
          <div>Menyetujui</div>
          <div>Ketua Bidang</div>
          <br />
          <div v-if="approver2">
            <img :src="approver2.signature" class="approver__signature" />
            <div class="approver__name">{{ approver2.name }}</div>
          </div>
          <div v-else class="approver__sign"></div>
        </div>
        <div class="form-preview__requester requester">
          <div>
            Surabaya, {{ approver1 ? approver1.created_at : '..............................' }}
          </div>
          <div>Ketua Komisi/Panitia/Tim</div>
          <br />
          <div v-if="approver1">
            <img :src="approver1.signature" class="requester__signature" />
            <div class="requester__name">{{ approver1.name }}</div>
          </div>
          <div v-else class="requester__sign"></div>
        </div>
        <div class="form-preview__approver-note">
          Catatan Ketua Bidang/PHMJ
          <div class="form-preview__approver-note-box"></div>
        </div>
      </div>

      <div v-if="attachmentFiles.length" class="form-preview__attachment attachments">
        <h4>Lampiran:</h4>
        <div class="attachments__files">
          <template v-for="(imageUrl, index) in attachmentFiles" :key="index">
            <a :href="imageUrl" target="_blank">
              <img v-if="isImage(imageUrl)" :src="imageUrl" class="attachments__image" />
              <div v-else class="pi pi-file attachments__doc"></div>
            </a>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { isUrlImage, getNameFromImageUrl } from '@/helpers/image';
import { CostItems, FormFields, FormlKeys, FormpKeys } from '@/types';
import { computed, defineComponent, PropType } from 'vue';
import FieldValueCost from './components/FieldValueCost.vue';
import FieldValueDefault from './components/FieldValueDefault.vue';
import FieldValueSourceFund from './components/FieldValueSourceFund.vue';

export default defineComponent({
  name: 'FormPreview',
  components: {
    FieldValueCost,
    FieldValueDefault,
    FieldValueSourceFund,
  },
  props: {
    inputs: {
      type: Array as PropType<FormFields<FormpKeys | FormlKeys>>,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    approver1: {
      type: Object as PropType<{ name: string; signature: string; created_at: string }>,
      default: null,
    },
    approver2: {
      type: Object as PropType<{ name: string; signature: string }>,
      default: null,
    },
  },
  setup(props) {
    const topTableFields = computed<FormFields<FormpKeys | FormlKeys>>(() =>
      props.inputs.slice(0, 2),
    );

    const mainTableFields = computed<FormFields<FormpKeys | FormlKeys>>(() =>
      props.inputs.slice(2),
    );

    const attachmentFiles = computed(
      () => props.inputs.find((input) => input.key === 'lampiran')?.value,
    );

    const title = computed<string>(() =>
      props.type === 'l' ? 'LAPORAN' : 'PENGAJUAN PELAKSANAAN',
    );

    const remainingBalance = computed<number>(() => {
      const balance =
        props.inputs
          .find((input) => input.key === 'sumber_dana')
          ?.children?.reduce((total, child) => total + (child.value as number), 0) || 0;
      const expenses =
        (props.inputs.find((input) => input.key === 'biaya')?.value as CostItems)?.reduce(
          (total, item) => total + item.count * item.price,
          0,
        ) || 0;

      return balance - expenses;
    });

    const getValue = (val: string | string[]) => {
      if (Array.isArray(val)) return val.length;
      return val;
    };

    const isImage = (imageUrl: string): boolean => isUrlImage(getNameFromImageUrl(imageUrl));

    return {
      topTableFields,
      mainTableFields,
      title,
      getValue,
      attachmentFiles,
      isImage,
      remainingBalance,
    };
  },
});
</script>

<style lang="scss" src="./FormPreview.scss" scoped></style>
