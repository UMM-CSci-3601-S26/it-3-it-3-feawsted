import { SupplyList } from "../supplylist/supplylist";

export interface Checklist {
  _id: string;
  studentName: string
  school: string;
  grade: string;
  requestedSupplies: string[];
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  supply: SupplyList;
  completed: boolean;
  unreceived: boolean;
  selectedOption: string;
}


