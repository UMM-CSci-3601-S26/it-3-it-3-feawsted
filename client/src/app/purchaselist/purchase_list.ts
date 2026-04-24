export interface AttributeOptions {
  allOf: string[];
  anyOf: string[];
}

export const GRADES: string[] = [
  'Pre-K', 'K', '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10', '11', '12',
  'High School'
];

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
