import formpField from '@/data/formp-field';
import { FormModule, FormpKeys, RootStateStore } from '@/types';
import { Module } from 'vuex';

const module: Module<FormModule<FormpKeys>, RootStateStore> = {
  namespaced: true,
  state: () => ({
    fields: formpField,
  }),
};

export default module;
