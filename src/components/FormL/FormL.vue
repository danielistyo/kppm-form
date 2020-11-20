<template>
  <card class="forml">
    <template #title> Form L </template>
    <template #content>
      <div class="p-fluid">
        <template v-for="(input, index) in formInputs" :key="index">
          <div v-if="input.type" class="p-field">
            <label class="forml__field-name" :for="input.name + 'ID'">{{ input.name }}</label>
            <component
              v-model="input.value"
              v-model:view="input.view"
              :is="input.type"
              :id="input.name + 'ID'"
              class="forml__field-input"
              v-bind="input.props"
            />
          </div>
        </template>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
import CalendarInput from '@/components/@globals/CalendarInput';
import Card from 'primevue/card';
import { FormLFields } from '@/types';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'FormL',
  components: {
    InputText,
    Card,
    CalendarInput,
  },
  setup() {
    const store = useStore();

    const formInputs: ComputedRef<FormLFields> = computed<FormLFields>(
      () => store.state.forml.fields,
    );
    return { formInputs };
  },
});
</script>

<style src="./FormL.scss" lang="scss" scoped></style>
