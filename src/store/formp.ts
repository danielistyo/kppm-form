import formpField from '@/data/formp-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import {
  FieldCostValue,
  FormpItem,
  FormpStates,
  RootStateStore,
  FormpKeys,
  SelectedFormp,
} from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';
import {
  APPROVAL_STATUS_APPROVED,
  APPROVAL_STATUS_DRAFT,
  APPROVAL_STATUS_REJECTED,
  APPROVAL_STATUS_WAITING,
} from '@/constants';
import dayjs from 'dayjs';

let onFormpValueChange:
  | ((a: firebase.database.DataSnapshot, b?: string | null | undefined) => any)
  | undefined;

const module: Module<FormpStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: cloneDeep(formpField),
    isGettingData: false,
    list: [],
  }),
  getters: {
    selectedFormp(state): Function {
      return (selectedKey: FormpKeys): SelectedFormp | undefined =>
        state.list.find(({ key }) => key === selectedKey);
    },
    statusCount(state) {
      return state.list.reduce(
        (counts, formp) => {
          if (formp.status === APPROVAL_STATUS_DRAFT || !formp.status) {
            counts.draft += 1;
          } else if (formp.status === APPROVAL_STATUS_WAITING) {
            counts.waiting += 1;
          } else if (formp.status === APPROVAL_STATUS_APPROVED) {
            counts.done += 1;
          }

          return counts;
        },
        { draft: 0, waiting: 0, done: 0 },
      );
    },
  },
  mutations: {
    parseResponse(state, response: Record<FormpKeys, FormpItem>) {
      state.list = [];
      Object.entries(response)
        .reverse()
        .forEach(([key, value]: [string, FormpItem]) => {
          state.list.push({ key: key as FormpKeys, ...value });
        });
    },
    clearFields(state) {
      state.fields = cloneDeep(formpField);
    },
    updateFormPFields(state, selectedFormp: SelectedFormp) {
      if (!selectedFormp) return;

      state.fields.forEach((field) => {
        if (field.key === 'lampiran') {
          // set empty array when lampiran doesnt exist
          field.value = selectedFormp?.[field.key] || [];
          return;
        }
        // set sumber dana field
        else if (field.key === 'sumber_dana') {
          field.children?.forEach((child) => {
            if (child.key === 'a' || child.key === 'b' || child.key === 'c') {
              const newValue = selectedFormp?.sumber_dana?.[child.key];
              if (newValue === null || newValue === undefined) {
                child.value = 0;
                return;
              }
              child.value = newValue;
            }
          });
        }
        // set biaya field
        else if (field.key === 'biaya') {
          if (selectedFormp?.biaya) {
            const data: Array<FieldCostValue> = [];
            // loop selectedFormp instead
            Object.values(selectedFormp?.biaya).forEach((biayaItem) => {
              data.push(biayaItem);
            });
            field.value = data;
          } else {
            field.value = [];
          }
        } else {
          field.value = selectedFormp?.[field.key] === undefined ? '' : selectedFormp?.[field.key];
          field.view && (field.view = '');
        }
      });
    },

    updateField(
      state,
      {
        key,
        keyChild,
        value,
        view,
      }: {
        key: string;
        keyChild: string;
        value: string | number | Array<FieldCostValue> | Array<string> | null;
        view: string | null;
      },
    ) {
      const copyOfFields = cloneDeep(state.fields);
      // find object as key value, then update value and view
      copyOfFields.find((field) => {
        const isFound = field.key === key;
        if (isFound) {
          if (keyChild) {
            const child = field.children?.find((child) => child.key === keyChild);
            if (child) {
              if (value !== null) child.value = value;
              if (typeof child.view === 'string' && typeof view === 'string') child.view = view;
            }
          } else {
            if (value !== null) field.value = value;
            if (typeof field.view === 'string' && typeof view === 'string') field.view = view;
          }
        }
        return isFound;
      });
      // assign to state
      state.fields = copyOfFields;
    },
  },
  actions: {
    getFormp({ commit, state, rootGetters }): void {
      const formpKppmRef = firebase
        .database()
        .ref(`/formps/${rootGetters['auth/selectedGroup']}/`)
        .orderByChild('created_at');
      state.isGettingData = true;
      onFormpValueChange = formpKppmRef.on(
        'value',
        (snapshot) => {
          const orderedData: { [key: string]: FormpItem } = {};

          snapshot.forEach((childSnapshot) => {
            if (typeof childSnapshot.key === 'string') {
              orderedData[childSnapshot.key] = childSnapshot.val();
            }
          });

          commit('parseResponse', orderedData);

          // update current selected fields
          const selectedFormpNameValue = state.fields.find((field) => field.key === 'nama_program')
            ?.value;
          const selectedFormp = state.list.find(
            (formp) => formp.nama_program === selectedFormpNameValue,
          );
          commit('updateFormPFields', selectedFormp);

          state.isGettingData = false;
        },
        (err) => {
          console.error(err);
        },
      );
    },
    unsubscribeFormpValue({ rootGetters }) {
      if (onFormpValueChange) {
        firebase
          .database()
          .ref(`/formps/${rootGetters['auth/selectedGroup']}/`)
          .off('value', onFormpValueChange);
      } else {
        return Promise.resolve('there is no formp subscription');
      }
    },
    chooseFormp({ commit, getters }, key: string): void {
      if (!key) return;

      const selectedFormp: SelectedFormp = getters.selectedFormp(key);
      selectedFormp && commit('updateFormPFields', selectedFormp);
    },
    updateStatus({ rootGetters }, { selectedKey, status }) {
      const timestamp: {
        proposed_at?: number;
        rejected_at?: number;
      } = {};
      if (status === APPROVAL_STATUS_WAITING) {
        timestamp.proposed_at = dayjs().unix();
      } else if (status === APPROVAL_STATUS_REJECTED) {
        timestamp.rejected_at = dayjs().unix();
      }
      return firebase
        .database()
        .ref(`/formps/${rootGetters['auth/selectedGroup']}/`)
        .child(selectedKey)
        .update(timestamp)
        .catch((err) => {
          console.error(err);
        });
    },
    approveForm({ state, rootGetters }, { selectedKey }) {
      const formp = cloneDeep(state.list.find((item) => item.key === selectedKey));
      const userId = firebase?.auth()?.currentUser?.uid;
      if (!userId || !formp) return;

      const updatedData: {
        status?: number;
        approver_ids?: string[];
        approved1_at?: number;
        approved2_at?: number;
      } = {
        approver_ids: formp.approver_ids,
      };

      if (formp?.approver_ids?.length === 0 || !updatedData.approver_ids) {
        updatedData.approved1_at = dayjs().unix();
        // create new array for approver
        updatedData.approver_ids = [];
      } else if (formp?.approver_ids?.length === 1) {
        updatedData.approved2_at = dayjs().unix();
        // change status when approvers are complete
        updatedData.status = APPROVAL_STATUS_APPROVED;
      }

      // add current user id to approver_ids
      updatedData.approver_ids.push(userId);

      return firebase
        .database()
        .ref(`/formps/${rootGetters['auth/selectedGroup']}/`)
        .child(selectedKey)
        .update(updatedData)
        .catch((err) => {
          console.error(err);
        });
    },
  },
};

export default module;
