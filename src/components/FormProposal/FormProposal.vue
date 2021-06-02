<template>
  <div class="form-proposal">
    <card>
      <template #title>
        Form {{ type.toUpperCase() }}
        <tag-label
          v-if="status"
          class="form-proposal__status"
          :severity="getStatus(status).severity"
          :value="getStatus(status).value"
        />

        <template v-if="options.length">
          <button-prime
            @click="toggleMenu"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            icon="pi pi-ellipsis-v"
            class="p-button-primary p-button-lg p-button-text"
            style="float:right;padding:0.2rem"
          />
          <Menu :model="options" ref="menu" append-to="body" popup />
        </template>
      </template>
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
                    :modelValue="child.value"
                    @update:modelValue="updateInputData(type, input.key, $event, null, child.key)"
                    :is="child.type"
                    :key="input.key + childIndex"
                    :id="child.name + 'ID'"
                    :disabled="[APPROVAL_STATUS_WAITING, APPROVAL_STATUS_APPROVED].includes(status)"
                    v-bind="child.props"
                    class="form-proposal__field-input-child"
                  />
                </div>
              </template>
              <component
                v-else
                :modelValue="input.value"
                @update:modelValue="updateInputData(type, input.key, $event, null)"
                :view="input.view"
                @update:view="updateInputData(type, input.key, null, $event)"
                :is="input.type"
                :key="input.key"
                :id="input.name + 'ID'"
                :disabled="[APPROVAL_STATUS_WAITING, APPROVAL_STATUS_APPROVED].includes(status)"
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
        :disabled="
          isLoading || [APPROVAL_STATUS_WAITING, APPROVAL_STATUS_APPROVED].includes(status)
        "
        class="form-proposal__submit"
      >
        {{ submitLabel }}
      </button-prime>
    </div>
  </div>
</template>

<script lang="ts">
import TagLabel from 'primevue/tag';
import { computed, defineComponent, nextTick, PropType, ref, toRef, watch } from 'vue';
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
import {
  ApprovalStatus,
  FieldCostValue,
  FormFields,
  FormlKeys,
  FormpKeys,
  PktKeys,
  RootStateStoreWithModule,
} from '@/types';
import ButtonPrime from 'primevue/button';
import { getStatus } from '@/helpers/status';
import Menu from 'primevue/menu';
import { APPROVAL_STATUS_WAITING, APPROVAL_STATUS_APPROVED } from '@/constants';
import { useStore } from 'vuex';

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
    TagLabel,
    Menu,
  },
  emits: ['pktchange', 'formsubmit', 'remove', 'propose', 'cancel'],
  props: {
    inputs: {
      type: Array as PropType<FieldType>,
      required: true,
    },
    type: {
      type: String as PropType<'l' | 'p' | 'pkt'>,
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
    menuOptions: {
      type: Array as PropType<Array<'hapus' | 'ajukan'>>,
      default: () => [],
    },
    submitLabel: {
      type: String,
      default: 'Kirim',
    },
    status: {
      type: Number as PropType<ApprovalStatus>,
      default: null,
    },
  },
  setup(props, { emit }) {
    const store = useStore<RootStateStoreWithModule>();
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
          if (formProposalEl) {
            // for desktop
            formProposalEl.scrollTop = 0;
            // for mobile
            document.documentElement.scrollTop = 0;
          }
        });
      },
      { immediate: true, deep: true },
    );

    const menu = ref();
    const toggleMenu = (event: Event) => {
      menu.value.toggle(event);
    };
    const menuOptions = {
      hapus: {
        label: 'Hapus',
        icon: 'pi pi-times',
        command: () => {
          emit('remove');
        },
      },
      ajukan: {
        label: 'Ajukan',
        icon: 'pi pi-send',
        command: () => {
          emit('propose');
        },
      },
      batalkan: {
        label: 'Batalkan',
        icon: 'pi pi-times',
        command: () => {
          emit('cancel');
        },
      },
    };

    const options = computed(() =>
      props.menuOptions.map((option: 'hapus' | 'ajukan') => menuOptions[option]),
    );

    const updateInputData = (
      type: string,
      key: string,
      value: string | number | Array<FieldCostValue> | Array<string>,
      view: string,
      keyChild: string,
    ) => {
      nextTick(() => {
        let module = 'pkt';
        if (['p', 'l'].includes(type)) module = `form${type}`;
        store.commit(`${module}/updateField`, {
          key,
          value,
          view,
          keyChild,
        });
      });
    };

    return {
      updateInputData,
      getStatus,
      selectedPktKey,
      options,
      menu,
      toggleMenu,
      APPROVAL_STATUS_WAITING,
      APPROVAL_STATUS_APPROVED,
    };
  },
});
</script>

<style src="./FormProposal.scss" lang="scss" scoped></style>
