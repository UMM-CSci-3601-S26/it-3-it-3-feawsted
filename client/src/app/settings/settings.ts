export interface SchoolInfo {
  name: string;         // e.g. "Morris Area High School"
  abbreviation: string; // e.g. "MAHS"
}

/**
 * Maps each availability slot key to an operator-defined clock time string.
 * Family documents store boolean flags against these same keys to record
 * which slots a family is available for.
 */
export interface TimeAvailabilityLabels {
  earlyMorning: string;
  lateMorning: string;
  earlyAfternoon: string;
  lateAfternoon: string;
}

export interface AppSettings {
  _id?: string;
  schools: SchoolInfo[];
  timeAvailability: TimeAvailabilityLabels;
}
