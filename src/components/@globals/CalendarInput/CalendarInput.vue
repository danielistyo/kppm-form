<template>
  <calendar v-model="computedValue" v-bind="$attrs" :selectionMode="selectionMode" />
  <div>
    Ganti
    <span
      :style="{ fontWeight: selectionMode === 'single' ? 'bold' : null }"
      @click="clickHandler('single')"
    >
      <u>single</u> </span
    >,
    <span
      :style="{ fontWeight: selectionMode === 'multiple' ? 'bold' : null }"
      @click="clickHandler('multiple')"
      ><u>multiple</u></span
    >
    atau
    <span
      :style="{ fontWeight: selectionMode === 'range' ? 'bold' : null }"
      @click="clickHandler('range')"
      ><u>jarak</u></span
    >
  </div>
</template>

<script lang="ts">
import Calendar from 'primevue/calendar';
import { computed, defineComponent, ref } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default defineComponent({
  name: 'CalendarInput',
  components: {
    Calendar,
  },
  emits: ['update:modelValue', 'update:view'],
  props: {
    modelValue: {
      type: [String, Array],
      required: true,
    },
    view: {
      type: String,
      required: false,
    },
  },
  setup(props, context) {
    type mode = 'single' | 'multiple' | 'range';
    const selectionMode = ref<mode>('single');

    const computedValue = computed<Date | Array<Date | null> | null>({
      get() {
        const modelValue: string | Array<any> = props.modelValue;

        // for multiple and range mode
        if (Array.isArray(modelValue)) {
          return modelValue.map((dt) => (dt ? dayjs(dt, 'DD-MM-YYYY').toDate() : null));
        }

        return modelValue ? dayjs(modelValue, 'DD-MM-YYYY').toDate() : null;
      },
      set(val: Date | Array<Date | null> | null) {
        console.log(val);

        // for multiple and range mode
        if (Array.isArray(val)) {
          const newVal: Array<string | null> = val.map((dt: Date | null) => {
            return dt
              ? dayjs(dt)
                  .format('DD-MM-YYYY')
                  .toString()
              : null;
          });
          context.emit('update:modelValue', newVal);
          const separator: string = selectionMode.value === 'range' ? ' - ' : ', ';
          context.emit('update:view', newVal.join(separator));
        }
        // for single mode
        else if (val) {
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

    const clickHandler = (choice: mode) => {
      context.emit('update:modelValue', '');
      selectionMode.value = choice;
    };

    return {
      computedValue,
      selectionMode,
      clickHandler,
    };
  },
});
</script>

<style lang="scss" scoped>
::v-deep {
  .p-datepicker table td > span {
    width: 1.5rem;
    height: 1.5rem;
  }
}

span {
  cursor: pointer;
}
</style>
