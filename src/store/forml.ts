import formlField from '@/data/forml-field.json';
import { FormLModule, RootStateStore } from '@/types';
import { Module } from 'vuex';

const module: Module<FormLModule, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: formlField,
  }),
};

export default module;
