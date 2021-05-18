<template>
  <div class="review">
    <div class="p-grid p-jc-between p-m-2">
      <button-prime
        v-if="showActions"
        @click="handleAction(true)"
        label="Setujui"
        icon="pi pi-check"
        iconPos="right"
        class="p-button-success"
        :loading="isLoading"
      />
      <button-prime
        v-if="showActions"
        @click="handleAction(false)"
        label="Tolak"
        icon="pi pi-times"
        iconPos="right"
        class="p-button-danger"
        :loading="isLoading"
      />
    </div>
    <form-preview :inputs="selectedFields" :type="type" class="review__preview" />
  </div>
</template>

<script lang="ts">
import FormPreview from '@/components/FormPreview';
import { FormFields, FormlKeys, FormpKeys, RootStateStore } from '@/types';
import { computed, defineComponent, nextTick, onMounted, ref, toRef, unref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import ButtonPrime from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { APPROVAL_STATUS_REJECTED } from '@/constants';

export default defineComponent({
  name: 'Review',
  components: { FormPreview, ButtonPrime },
  setup() {
    const confirm = useConfirm();
    const toast = useToast();
    const route = useRoute();
    const store = useStore<RootStateStore>();
    const isLoading = ref(true);
    const type = computed(() => route.query.type);

    const selectedForm = computed(() => {
      if (route.query.type === 'l')
        return store.state.forml.list.find((item) => item.key === route.query.key);
      if (route.query.type === 'p')
        return store.state.formp.list.find((item) => item.key === route.query.key);
    });

    const selectedFields = computed<FormFields<FormpKeys | FormlKeys>>(() => {
      if (route.query.type === 'p') return store.state.formp.fields;
      if (route.query.type === 'l') return store.state.forml.fields;
      return [];
    });

    // for updating data when users come from dashboard
    watch(
      () => route.query,
      (query: { type?: 'p' | 'l'; key?: string }) => {
        if (query.type && query.key) {
          store.dispatch(`form${route.query.type}/chooseForm${route.query.type}`, query.key);
          isLoading.value = false;
        }
      },
      { immediate: true },
    );

    // for updating data when users reloa page
    const { formp, forml } = store.state;
    watch(
      [toRef(forml, 'isGettingData'), toRef(formp, 'isGettingData')],
      ([formLLoading, formPLoading]) => {
        if (!formLLoading || !formPLoading) {
          store.dispatch(`form${route.query.type}/chooseForm${route.query.type}`, route.query.key);
          isLoading.value = false;
        } else {
          isLoading.value = true;
        }
      },
    );

    const handleAction = (isApprove: boolean): void => {
      confirm.require({
        message: `Anda yakin ingin ${isApprove ? 'menyetujui' : 'menolak'} form ini "${
          selectedFields.value.find((field) => field.key === 'nama_program')?.value
        }"?`,
        header: 'Perhatian!',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: isApprove ? '' : 'p-button-danger',
        accept: async () => {
          try {
            if (isApprove)
              await store.dispatch(`form${route.query.type}/approveForm`, {
                selectedKey: route.query.key,
              });
            else
              await store.dispatch(`form${route.query.type}/updateStatus`, {
                selectedKey: route.query.key,
                status: APPROVAL_STATUS_REJECTED,
              });

            toast.add({
              severity: 'success',
              summary: `Form berhasil ${isApprove ? 'disetujui' : 'ditolak'}!`,
              life: 3000,
            });
          } catch (error) {
            console.log(error);
            toast.add({
              severity: 'error',
              summary: 'Terjadi Kesalahan!',
              life: 5000,
            });
          }
        },
        reject: () => {
          confirm.close();
        },
      });
    };

    const userId = computed(() => {
      return store.state.auth.userId;
    });

    const showActions = computed(() => {
      const userIdString = unref(userId);
      if (!userIdString) return false;
      if (!store.state.auth.signature) return false;

      return (
        !selectedForm.value?.approver_ids ||
        (selectedForm.value.approver_ids && !selectedForm.value.approver_ids.includes(userIdString))
      );
    });

    onMounted(() => {
      nextTick(() => {
        // scroll to top of form proposal component
        const reviewEl = document.querySelector('.review');
        if (reviewEl) {
          // for desktop
          reviewEl.scrollTop = 0;
          // for mobile
          document.documentElement.scrollTop = 0;
        }
      });
    });

    return { selectedFields, type, handleAction, selectedForm, showActions, isLoading };
  },
});
</script>

<style lang="scss" scoped>
.review {
  max-width: 768px;
  margin: auto;

  &__preview {
    width: 100%;
    height: auto;
    font-size: 2vw;
    padding: 0;

    @media screen and (min-width: 768px) {
      font-size: 14px;
    }
  }
}
</style>

<style lang="scss">
@media print {
  .review .form-preview {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: auto;
    overflow-y: visible;
    z-index: 100;
    width: 100vw;
    padding: 0;
  }
}
</style>
