<template>
  <div v-if="forms.length" class="list-approval-form">
    <div
      v-for="(form, index) in forms"
      :key="index"
      :class="{ odd: index % 2 === 0, even: index % 2 === 1 }"
      class="list-approval-form__item"
    >
      <router-link
        :to="{
          name: 'Review',
          query: { key: form.key, type: form.type === 'formps' ? 'p' : 'l' },
        }"
      >
        <card>
          <template #content>
            <div>
              <tag-label
                class="form-proposal__status"
                :severity="form.type === 'formls' ? 'default' : 'info'"
                :value="form.type === 'formls' ? 'FORM L' : 'FORM P'"
              />
              -
              <label>{{ form.group.toUpperCase() }}</label>
            </div>
            <h4 class="list-approval-form__title">
              {{ form.nomor_program }} - {{ form.nama_program }}
            </h4>
          </template>
        </card>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import TagLabel from 'primevue/tag';
import Card from 'primevue/card';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ListApprovalForm',
  components: {
    Card,
    TagLabel,
  },
  props: {
    forms: { type: Array, required: true },
  },
});
</script>

<style lang="scss" src="./ListApprovalForm.scss" scoped></style>
