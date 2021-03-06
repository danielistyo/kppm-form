import formpField from '@/data/formp-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import { FieldCostValue, FormModule, FormpKeys, RootStateStore, SelectedPkt } from '@/types';
import { Module } from 'vuex';

const module: Module<FormModule<FormpKeys>, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: cloneDeep(formpField),
  }),
  mutations: {
    clearFields(state) {
      state.fields = cloneDeep(formpField);
    },
    updateFormPFields(state, selectedPkt: SelectedPkt) {
      if (!selectedPkt) return;

      state.fields.forEach((field) => {
        // set sumber dana field
        if (field.key === 'sumber_dana') {
          field.children?.forEach((child) => {
            if (child.key === 'a' || child.key === 'b' || child.key === 'c') {
              const newValue = selectedPkt?.sumber_dana?.[child.key];
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
          if (selectedPkt?.biaya) {
            const data: Array<FieldCostValue> = [];
            // loop selectedPkt instead
            Object.values(selectedPkt?.biaya).forEach((biayaItem) => {
              data.push(biayaItem);
            });
            field.value = data;
          } else {
            field.value = [];
          }
        } else if (field.key !== 'lampiran' && field.key !== 'pihak_luar') {
          field.value = selectedPkt?.[field.key];
          field.view && (field.view = '');
        }
      });
    },
  },
};

export default module;
