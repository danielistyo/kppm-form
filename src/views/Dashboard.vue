<template>
  <div class="dashboard">
    <h2 class="p-pt-5 p-pb-0">Selamat datang, {{ name }}!</h2>

    <card class="p-mb-5">
      <template #content>
        <h4 v-if="!signature" class="p-mb-2 p-mt-0">
          Anda belum mengunggah tanda tangan. Silakan unggah tanda tangan anda agar dapat mengajukan
          atau memeriksa form.
        </h4>
        <h4 v-else class="p-mt-0">Anda sudah mempunyai tandatangan</h4>
        <image-uploader v-model="signatureUrls" :hide-header="!!signatureUrls.length" />
      </template>
    </card>

    <div class="p-grid">
      <card class="p-col p-mr-2 p-ml-2 p-mb-2">
        <template #title>Form P</template>
        <template #content>
          <div class="card-statistic">
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formpCount.draft }}
                <div class="card-statistic__label">Draft</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formpCount.waiting }}
                <div class="card-statistic__label">Pengajuan</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formpCount.done }}
                <div class="card-statistic__label">Selesai</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
          </div>
        </template>
      </card>
      <card class="p-col p-ml-2 p-mr-2 p-mb-2">
        <template #title>Form L</template>
        <template #content>
          <div class="card-statistic">
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formlCount.draft }}
                <div class="card-statistic__label">Draft</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formlCount.waiting }}
                <div class="card-statistic__label">Pengajuan</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
            <div class="card-statistic__item">
              <template v-if="!isLoading">
                {{ formlCount.done }}
                <div class="card-statistic__label">Selesai</div>
              </template>
              <skeleton v-else width="50px" height="50px" />
            </div>
          </div>
        </template>
      </card>
    </div>

    <template v-if="!isLoading">
      <h2 class="p-pt-5" v-if="formNeedApproval.length">Perlu diperiksa:</h2>
      <h2 v-else># Tidak ada form yang perlu diperiksa.</h2>
      <list-approval-form :forms="formNeedApproval" />
    </template>
    <div v-else class="p-grid p-p-2">
      <div class="p-col-6">
        <skeleton width="100%" height="50px" />
      </div>
      <div class="p-col-6">
        <skeleton width="100%" height="50px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Card from 'primevue/card';
import firebase from 'firebase/app';
import { FormpItem, FormlItem, Groups, RootStateStore } from '@/types';
import { computed, defineComponent, ref, unref, watch } from 'vue';
import { mapGetters, useStore } from 'vuex';
import { APPROVAL_STATUS_WAITING } from '@/constants';
import ListApprovalForm from '@/components/ListApprovalForm';
import Skeleton from 'primevue/skeleton';
import ImageUploader from '@/components/ImageUploader';

export default defineComponent({
  name: 'Dashboard',
  components: {
    Card,
    ListApprovalForm,
    Skeleton,
    ImageUploader,
  },
  setup() {
    const store = useStore<RootStateStore>();

    const signature = computed(() => {
      return store.state.auth.signature;
    });
    const signatureUrls = ref<string[]>([]);
    if (signature.value) signatureUrls.value.push(signature.value);

    watch(signatureUrls, (signatureUrlsNew, signatureUrlsOld) => {
      if (store.state.auth.userId) {
        const userRef = firebase
          .database()
          .ref('/users/')
          .child(store.state.auth.userId);

        if (signatureUrlsNew.length) {
          userRef.update({ signature: signatureUrlsNew[0] });
        } else {
          userRef.update({ signature: null });

          // delete old signature image
          if (signatureUrlsOld.length) {
            const res = signatureUrlsOld[0].match(/(?<=%2F)(.*)(?=\?alt=media)/);
            const filename = res?.length ? res[0] : '';
            firebase
              .storage()
              .ref()
              .child('uploads/')
              .child(filename)
              .delete();
          }
        }
      }
    });

    const isLoading = ref(true);
    const name = computed(() => {
      return store.state.auth.name;
    });

    const groupForms = ref<{ [k: string]: Array<FormpItem | FormlItem> }>({});
    const formNeedApproval = computed<Array<FormpItem | FormlItem>>(() => {
      const forms = Object.values(groupForms.value);
      const newForms = forms.reduce((arr, items) => {
        return arr.concat(items);
      }, []);

      const userId = firebase?.auth()?.currentUser?.uid;
      if (userId) {
        // skip form that already been signed
        return newForms.filter((form) => !form.approver_ids?.includes(userId));
      }
      return newForms;
    });

    const approvalGroups = computed<{ approve1: Groups[]; approve2: Groups[] }>(() => {
      return store.getters['auth/approvalGroups'];
    });
    watch(
      approvalGroups,
      async (approvalGroupsNew) => {
        const formType = ['formls', 'formps'];

        type FormsWithGroupAndType = Array<
          (FormpItem | FormlItem) & { type: string; group: string; key: string }
        >;
        // create function to return promise in order to be able to be waited
        const processGroup = (
          group: Groups[],
          filterApprove2?: (forms: FormsWithGroupAndType) => FormsWithGroupAndType,
        ) =>
          new Promise((resolve) => {
            if (!group.length) resolve(true);
            group.forEach((group: Groups) => {
              formType.forEach(async (t) => {
                await firebase
                  .database()
                  .ref(`/${t}/${group}/`)
                  .orderByChild('status')
                  .equalTo(APPROVAL_STATUS_WAITING)
                  .on('value', (res) => {
                    const data = res.val();
                    let forms: FormsWithGroupAndType = Object.keys(data).map((key) => {
                      return { ...(data[key] as FormpItem | FormlItem), type: t, group, key };
                    });
                    // filter data to get form which requires second approver sign
                    if (filterApprove2) forms = filterApprove2(forms);
                    groupForms.value[t] = forms;
                    resolve(true);
                  });
              });
            });
          });
        await processGroup(approvalGroupsNew.approve1);
        // send second parameter to get second approval form only
        await processGroup(approvalGroupsNew.approve2, (forms) => {
          return forms.filter((form) => form.approver_ids?.length === 1);
        });
        isLoading.value = false;
      },
      { immediate: true },
    );

    return {
      name,
      formNeedApproval,
      groupForms,
      isLoading,
      approvalGroups,
      signatureUrls,
      signature,
    };
  },
  computed: {
    ...mapGetters({ formpCount: 'formp/statusCount', formlCount: 'forml/statusCount' }),
  },
});
</script>

<style lang="scss" scoped>
.dashboard {
  max-width: 768px;
  margin: auto;
}

.card-statistic {
  display: flex;
  justify-content: space-between;

  &__item {
    margin: 0 10px;
    font-size: 24px;
    text-align: center;
  }

  &__label {
    font-size: 16px;
  }
}
</style>
