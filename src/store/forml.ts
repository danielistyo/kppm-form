import formlField from '@/data/forml-field';
import { FormlKeys, FormModule, RootStateStore } from '@/types';
import { Module } from 'vuex';

const module: Module<FormModule<FormlKeys>, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: formlField,
  }),
};

export default module;
