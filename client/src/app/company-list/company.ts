import { UserNameId } from './user-name-id';

export interface Company {
  _id: string;  // The name of the company
  count: number; // The number of users in the company
  users: UserNameId[]; // The users in the company
}
