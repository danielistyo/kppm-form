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
  },
  mutations: {
    parseResponse(state, response: Record<FormpKeys, FormpItem>) {
      state.list = [];
      Object.entries(response).forEach(([key, value]: [string, FormpItem]) => {
        state.list.push({ key: key as FormpKeys, ...value });
      });
    },
    clearFields(state) {
      state.fields = cloneDeep(formpField);
    },
    updateFormPFields(state, selectedFormp: SelectedFormp) {
      if (!selectedFormp) return;

      state.fields.forEach((field) => {
        if (field.key === 'lampiran' || field.key === 'pihak_luar') return;

        // set sumber dana field
        if (field.key === 'sumber_dana') {
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
          field.value = selectedFormp?.[field.key];
          field.view && (field.view = '');
        }
      });
    },
  },
  actions: {
    getFormp({ commit, state }): void {
      const formpKppmRef = firebase.database().ref('/formps/kppm/');
      state.isGettingData = true;
      formpKppmRef.on('value', (snapshot) => {
        state.isGettingData = false;
        commit('parseResponse', snapshot.val());

        // update current selected fields
        const selectedFormpNameValue = state.fields.find((field) => field.key === 'nama_program')
          ?.value;
        const selectedFormp = state.list.find(
          (formp) => formp.nama_program === selectedFormpNameValue,
        );
        commit('updateFormPFields', selectedFormp);
      });
    },
    chooseFormp({ commit, getters }, key: string): void {
      if (!key) return;

      const selectedFormp: SelectedFormp = getters.selectedFormp(key);
      selectedFormp && commit('updateFormPFields', selectedFormp);
    },
  },
};

export default module;
