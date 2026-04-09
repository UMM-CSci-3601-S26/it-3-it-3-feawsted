export interface AttributeOptions {
  allOf: string[];
  anyOf: string[];
}

export interface SupplyList {
  _id?: string,
  district?: string,
  school: string,
  grade: string,
  teacher?: string,
  academicYear?: string,
  item: string[],
  brand: AttributeOptions,
  color: AttributeOptions,
  size: string,
  type: AttributeOptions,
  style: AttributeOptions,
  material: AttributeOptions,
  count: number,
  quantity: number,
  notes: string
}

type NodeKind = 'school' | 'grade' | 'item';

export interface SupplyTreeNode {
  kind: NodeKind;
  name: string;
  children?: SupplyTreeNode[];
}
