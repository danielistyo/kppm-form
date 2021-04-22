<template>
  <div class="form-proposal">
    <card>
      <template #title> Form {{ type.toUpperCase() }} </template>
      <template #content>
        <div class="p-fluid">
          <div v-if="showPkt" class="p-field form-proposal__field">
            <label class="form-proposal__field-name" for="pktField">PKT</label>

            <pkt-dropdown v-model="selectedPktKey" />
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

    <div class="form-proposal__footer">
      <button-prime
        @click="$emit('formsubmit')"
        :disabled="isLoading"
        class="form-proposal__submit"
      >
        {{ submitLabel }}
      </button-prime>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, ref, toRef, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import TextArea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import SimpleEditor from '@/components/@globals/SimpleEditor';
import CalendarInput from '@/components/@globals/CalendarInput';
import PktDropdown from '@/components/@globals/PktDropdown';
import CostInput from '@/components/@globals/CostInput';
import ImageUploader from '@/components/ImageUploader';
import Card from 'primevue/card';
import { FormFields, FormlKeys, FormpKeys, PktKeys } from '@/types';
import ButtonPrime from 'primevue/button';

type FieldType = FormFields<PktKeys | FormpKeys | FormlKeys>;

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
    PktDropdown,
    ButtonPrime,
    ImageUploader,
  },
  emits: ['pktchange', 'formsubmit'],
  props: {
    /* TODO: it shouldn't be used for vmodel directly. Because it will mutate this props and vuex data also */
    inputs: {
      type: Array as PropType<FieldType>,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: (val: string) => {
        return ['l', 'p', 'pkt'].includes(val);
      },
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    showPkt: {
      type: Boolean,
      default: false,
    },
    submitLabel: {
      type: String,
      default: 'Kirim',
    },
  },
  setup(props, { emit }) {
    const selectedPktKey = ref<string>('');

    watch(selectedPktKey, (newSelectedPktKey) => {
      emit('pktchange', newSelectedPktKey);
    });

    watch(
      toRef(props, 'isLoading'),
      () => {
        nextTick(() => {
          // because there is bug on simple editor component, then we need to set focus on first element then lose it.
          // so we can use backspace on desktop to go back previous page
          const firstInput = document.querySelector('.form-proposal input') as HTMLElement;
          firstInput?.focus();
          firstInput?.blur();

          // scroll to top of form proposal component
          const formProposalEl = document.querySelector('.form-proposal');
          if (formProposalEl) formProposalEl.scrollTop = 0;
        });
      },
      { immediate: true, deep: true },
    );

    return { selectedPktKey };
  },
});
</script>

<style src="./FormProposal.scss" lang="scss" scoped></style>
