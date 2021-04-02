import formlField from '@/data/forml-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import {
  FieldCostValue,
  FormlItem,
  FormlKeys,
  FormlStates,
  RootStateStore,
  RootStateStoreWithModule,
  SelectedForml,
} from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';

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
        if (field.key === 'lampiran') return;

        // set sumber dana field
        if (field.key === 'sumber_dana') {
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
  },
  actions: {
    getForml({ commit, state, rootState }): void {
      const formlKppmRef = firebase
        .database()
        .ref(`/formls/${(rootState as RootStateStoreWithModule).auth.group}/`)
        .orderByChild('created_at');

      state.isGettingData = true;

      onFormlValueChange = formlKppmRef.on(
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
    unsubscribeFormlValue({ rootState }) {
      onFormlValueChange &&
        firebase
          .database()
          .ref(`/formls/${(rootState as RootStateStoreWithModule).auth.group}/`)
          .off('value', onFormlValueChange);
    },
    chooseForml({ commit, getters }, key: string): void {
      if (!key) return;

      const selectedForml: SelectedForml = getters.selectedForml(key);
      selectedForml && commit('updateFormLFields', selectedForml);
    },
  },
};

export default module;
