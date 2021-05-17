import formlField from '@/data/forml-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import {
  FieldCostValue,
  FormlItem,
  FormlKeys,
  FormlStates,
  RootStateStore,
  SelectedForml,
} from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';
import {
  APPROVAL_STATUS_APPROVED,
  APPROVAL_STATUS_DRAFT,
  APPROVAL_STATUS_WAITING,
} from '@/constants';

let onFormlValueChange:
  | ((a: firebase.database.DataSnapshot, b?: string | null | undefined) => any)
  | undefined;

const module: Module<FormlStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: cloneDeep(formlField),
    isGettingData: false,
    list: [],
  }),
  getters: {
    selectedForml(state): Function {
      return (selectedKey: FormlKeys): SelectedForml | undefined =>
        state.list.find(({ key }) => key === selectedKey);
    },
    statusCount(state) {
      return state.list.reduce(
        (counts, forml) => {
          if (forml.status === APPROVAL_STATUS_DRAFT || !forml.status) {
            counts.draft += 1;
          } else if (forml.status === APPROVAL_STATUS_WAITING) {
            counts.waiting += 1;
          } else if (forml.status === APPROVAL_STATUS_APPROVED) {
            counts.done += 1;
          }

          return counts;
        },
        { draft: 0, waiting: 0, done: 0 },
      );
    },
  },
  mutations: {
    parseResponse(state, response: Record<FormlKeys, FormlItem>) {
      state.list = [];
      Object.entries(response)
        .reverse()
        .forEach(([key, value]: [string, FormlItem]) => {
          state.list.push({ key: key as FormlKeys, ...value });
        });
    },
    clearFields(state) {
      state.fields = cloneDeep(formlField);
    },
    updateFormLFields(state, selectedForml: SelectedForml) {
      if (!selectedForml) return;

      state.fields.forEach((field) => {
        if (field.key === 'lampiran') {
          // set empty array when lampiran doesnt exist
          field.value = selectedForml?.[field.key] || [];
          return;
        }

        // set sumber dana field
        else if (field.key === 'sumber_dana') {
          field.children?.forEach((child) => {
            if (child.key === 'a' || child.key === 'b' || child.key === 'c') {
              const newValue = selectedForml?.sumber_dana?.[child.key];
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
          if (selectedForml?.biaya) {
            const data: Array<FieldCostValue> = [];
            // loop selectedForml instead
            Object.values(selectedForml?.biaya).forEach((biayaItem) => {
              data.push(biayaItem);
            });
            field.value = data;
          } else {
            field.value = [];
          }
        } else {
          field.value = selectedForml?.[field.key] || field.value;
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
    getForml({ commit, state, rootGetters }): void {
      const formlRef = firebase
        .database()
        .ref(`/formls/${rootGetters['auth/selectedGroup']}/`)
        .orderByChild('created_at');

      state.isGettingData = true;

      onFormlValueChange = formlRef.on(
        'value',
        (snapshot) => {
          const orderedData: { [key: string]: FormlItem } = {};

          snapshot.forEach((childSnapshot) => {
            if (typeof childSnapshot.key === 'string') {
              orderedData[childSnapshot.key] = childSnapshot.val();
            }
          });

          commit('parseResponse', orderedData);

          // update current selected fields
          const selectedFormlNameValue = state.fields.find((field) => field.key === 'nama_program')
            ?.value;
          const selectedForml = state.list.find(
            (forml) => forml.nama_program === selectedFormlNameValue,
          );
          commit('updateFormLFields', selectedForml);

          state.isGettingData = false;
        },
        (err) => {
          console.error(err);
        },
      );
    },
    unsubscribeFormlValue({ rootGetters }) {
      if (onFormlValueChange) {
        firebase
          .database()
          .ref(`/formls/${rootGetters['auth/selectedGroup']}/`)
          .off('value', onFormlValueChange);
      } else {
        return Promise.resolve('there is no forml subscription');
      }
    },
    chooseForml({ commit, getters }, key: string): void {
      if (!key) return;

      const selectedForml: SelectedForml = getters.selectedForml(key);
      selectedForml && commit('updateFormLFields', selectedForml);
    },
    updateStatus({ state, rootGetters }, { selectedKey, status }) {
      const forml = cloneDeep(state.list.find((item) => item.key === selectedKey));
      if (forml) {
        const { key, ...clearData } = forml;
        clearData.status = status;
        return firebase
          .database()
          .ref(`/formls/${rootGetters['auth/selectedGroup']}/`)
          .update({ [selectedKey]: clearData })
          .catch((err) => {
            console.error(err);
          });
      }
      return Promise.resolve(null);
    },
    approveForm({ state, rootGetters }, { selectedKey }) {
      const forml = cloneDeep(state.list.find((item) => item.key === selectedKey));
      const userId = firebase?.auth()?.currentUser?.uid;
      if (!userId || !forml) return;

      const { key, ...clearData } = forml;

      // change status when approvers are complete
      if (forml?.approver_ids?.length === 1) {
        clearData.status = APPROVAL_STATUS_APPROVED;
      }

      // create new array for approver
      if (!clearData.approver_ids) clearData.approver_ids = [];
      clearData.approver_ids.push(userId);

      return firebase
        .database()
        .ref(`/formls/${rootGetters['auth/selectedGroup']}/`)
        .update({ [selectedKey]: clearData })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};

export default module;
