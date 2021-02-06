interface FieldCostValue {
  name: string;
  count: number;
  price: number;
}

export interface FormLField {
  id: number;
  name: string;
  type: string | null;
  children?: FormLFields;
  value?: string | Array<FieldCostValue>;
  props?: Record<string, string | boolean | null | number | undefined | string[]>;
}

export type FormLFields = Array<FormLField>;

export interface CostItem {
  name: string;
  count: number;
  price: number;
}

export type CostItems = Array<CostItem | unknown>;

/**** START STORE TYPE *****/

export interface FormLModule {
  fields: FormLFields;
}

export interface RootStateStore {
  master: null | string;
}

/**** END STORE TYPE *****/
