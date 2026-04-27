export interface AttributeOptions {
  allOf: string[];
  anyOf: string[];
}

export interface PurchaseList {
  _id?: string,
  item: string[],
  brand: AttributeOptions,
  color: AttributeOptions,
  size: string,
}

type NodeKind = 'school' | 'grade' | 'item';

export interface PurchaseTreeNode {
  kind: NodeKind;
  name: string;
  children?: PurchaseTreeNode[];
}
