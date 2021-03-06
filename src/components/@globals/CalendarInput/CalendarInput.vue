<template>
  <calendar
    v-if="selectionMode !== 'text'"
    v-model="computedValue"
    v-bind="$attrs"
    :selectionMode="selectionMode"
  />
  <input-text v-else v-model="computedValue" v-bind="$attrs" />
  <div class="calendar-input__options">
    Opsi:
    <template v-for="(md, index) in mode" :key="index">
      <span
        :style="{ fontWeight: selectionMode === md ? 'bold' : undefined }"
        @click="clickHandler(md)"
      >
        <u>{{ md }}</u>
      </span>
      <template v-if="index === mode.length - 2"> atau </template>
      <template v-else-if="index !== mode.length - 1">, </template>
    </template>
  </div>
</template>

<script lang="ts">
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import { computed, defineComponent, PropType, ref, toRef, unref, watch } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default defineComponent({
  name: 'CalendarInput',
  components: {
    Calendar,
    InputText,
  },
  emits: ['update:modelValue', 'update:view'],
  props: {
    modelValue: {
      type: [String, Array] as PropType<string | Array<string>>,
      required: true,
    },
    view: {
      type: String,
      required: false,
    },
  },
  setup(props, context) {
    const mode = ['single', 'multiple', 'range', 'text'];
    type Mode = 'single' | 'multiple' | 'range' | 'text';
    const selectionMode = ref<Mode>('single');

    watch(
      toRef(props, 'modelValue'),
      (modelValue) => {
        if (typeof modelValue === 'string') {
          if (modelValue === '') return;
          else if (/\d{2}-\d{2}-\d{4} - \d{2}-\d{2}-\d{4}/.test(modelValue)) {
            selectionMode.value = 'range';

            // because at beginning, the value is string, it needs to be changed into array of string first
            context.emit('update:modelValue', (modelValue as string).split(' - '));
            context.emit('update:view', modelValue);
          } else if (/(\d{2}-\d{2}-\d{4}, )+\d{2}-\d{2}-\d{4}/.test(modelValue)) {
            selectionMode.value = 'multiple';

            // because at beginning, the value is string, it needs to be changed into array of string first
            context.emit('update:modelValue', (modelValue as string).split(', '));
            context.emit('update:view', modelValue);
          } else if (dayjs(modelValue, 'DD-MM-YYYY').isValid()) selectionMode.value = 'single';
          else selectionMode.value = 'text';
        } else if (Array.isArray(modelValue)) {
          if (props.view?.includes(',')) selectionMode.value = 'multiple';
          else if (props.view?.includes(' - ')) selectionMode.value = 'range';
        }
      },
      { immediate: true },
    );

    type ComputedValueType = Date | Array<Date | null> | null | string;
    const computedValue = computed<ComputedValueType>({
      get() {
        if (unref(selectionMode) === 'text' && typeof props.modelValue === 'string')
          return props.modelValue;

        const modelValue: string | Array<string> = props.modelValue;

        // for multiple and range mode
        if (Array.isArray(modelValue)) {
          return modelValue.map((dt) => (dt ? dayjs(dt, 'DD-MM-YYYY').toDate() : null));
        }

        return modelValue ? dayjs(modelValue, 'DD-MM-YYYY').toDate() : null;
      },
      set(val: ComputedValueType) {
        if (unref(selectionMode) === 'text') {
          context.emit('update:modelValue', val);
          context.emit('update:view', val);
        }
        // for multiple and range mode
        else if (
          Array.isArray(val) &&
          (unref(selectionMode) === 'multiple' || unref(selectionMode) === 'range')
        ) {
          const newVal: Array<string | null> = val.map((dt: Date | null) => {
            return dt
              ? dayjs(dt)
                  .format('DD-MM-YYYY')
                  .toString()
              : null;
          });
          context.emit('update:modelValue', newVal);
          const separator: string = unref(selectionMode) === 'range' ? ' - ' : ', ';
          context.emit('update:view', newVal.join(separator));
        }
        // for single mode
        else if (unref(selectionMode) === 'single' && val && !Array.isArray(val)) {
          const dateString = dayjs(val)
            .format('DD-MM-YYYY')
            .toString();
          context.emit('update:modelValue', dateString);
          context.emit('update:view', dateString);
        }
        // for clear all value
        else {
          context.emit('update:modelValue', '');
          context.emit('update:view', '');
        }
      },
    });

    const clickHandler = (choice: Mode) => {
      let value: string | Array<string> = '';
      if (choice === 'multiple' || choice === 'range') {
        value = [];
      }
      context.emit('update:modelValue', value);
      context.emit('update:view', '');
      selectionMode.value = choice;
    };

    return {
      computedValue,
      selectionMode,
      clickHandler,
      mode,
    };
  },
});
</script>

<style lang="scss" scoped>
::v-deep(.p-datepicker table td > span) {
  width: 1.5rem;
  height: 1.5rem;
}

span {
  cursor: pointer;
}

.calendar-input__options {
  font-size: 0.95em;
}
</style>
