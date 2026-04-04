export interface SchoolInfo {
  name: string;
  abbreviation: string;
}

export interface Settings {
  _id?: string;
  schools?: SchoolInfo[];
}
