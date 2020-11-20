interface FieldProp {
  [key: string]: string | boolean | null | number;
}

interface FieldCostValue {
  item: string;
  count: number;
  price: number;
}

export interface FormLField {
  id: number;
  name: string;
  type: string | null;
  children?: FormLFields;
  value?: string | Array<FieldCostValue>;
  props?: FieldProp;
}

export type FormLFields = Array<FormLField>;

/**** START STORE TYPE *****/

export interface FormLModule {
  fields: FormLFields;
}

export interface RootStateStore {
  master: null | string;
}

/**** END STORE TYPE *****/
