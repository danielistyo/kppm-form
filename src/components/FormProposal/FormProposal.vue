<template>
  <card class="form-proposal">
    <template #title> Form {{ type.toUpperCase() }} </template>
    <template #content>
      <div class="p-fluid">
        <div class="p-field form-proposal__field">
          <label class="form-proposal__field-name" for="pktField">PKT</label>
          <dropdown
            v-model="selectedPktKey"
            :options="pktChoices"
            :disabled="isGettingPkt"
            :placeholder="isGettingPkt ? 'Loading...' : 'Pilih PKT Anda di sini'"
            optionLabel="nameChoice"
            optionValue="valueChoice"
            class="pkt__choices"
          />
        </div>
        <template v-for="(input, index) in inputs" :key="index">
          <div class="p-field form-proposal__field">
            <label class="form-proposal__field-name" :for="input.name + 'ID'">
              {{ input.name }}
            </label>
            <!-- for looping input when has children -->
            <template v-if="input.children && input.children.length">
              <div v-for="(child, childIndex) in input.children" :key="childIndex">
                <label class="form-proposal__field-name-child" :for="child.name + 'ID'">
                  {{ child.name }}
                </label>
                <component
                  v-model="child.value"
                  :is="child.type"
                  :id="child.name + 'ID'"
                  v-bind="child.props"
                  class="form-proposal__field-input-child"
                />
              </div>
            </template>
            <component
              v-else
              v-model="input.value"
              v-model:view="input.view"
              :is="input.type"
              :id="input.name + 'ID'"
              class="form-proposal__field-input"
              v-bind="input.props"
            />
          </div>
        </template>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import TextArea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import SimpleEditor from '@/components/@globals/SimpleEditor';
import CalendarInput from '@/components/@globals/CalendarInput';
import CostInput from '@/components/@globals/CostInput';
import Card from 'primevue/card';
import { FormFields, FormlKeys, FormpKeys } from '@/types';
import pktComposables from '@/composables/pkt';

type FieldType = FormFields<FormpKeys | FormlKeys>;

export default defineComponent({
  name: 'FormProposal',
  components: {
    InputText,
    InputNumber,
    Card,
    CalendarInput,
    SimpleEditor,
    CostInput,
    TextArea,
    Dropdown,
  },
  props: {
    inputs: {
      type: Array as PropType<FieldType>,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator(val: string) {
        return ['l', 'p', 'pkt'].includes(val);
      },
    },
  },
  setup() {
    const pktData = pktComposables();
    return { ...pktData };
  },
});
</script>

<style src="./FormProposal.scss" lang="scss" scoped></style>
