
/**
 * This file defines Family interfaces for the ReadyForSupplies application. It includes the StudentInfo interface, which represents information about a student such as their name, grade, school, and requested supplies.
 * The Family interface represents a family unit, including the guardian's name, email, address, time slot for pickup, and an array of students. Additionally, the DashboardStats interface defines the structure for statistics displayed on the dashboard,
 * including counts of students per school and grade, as well as the total number of families served. These interfaces are used throughout the Family component and related services to ensure type safety and consistency when handling family data and
 * statistics within the application.
 */

// An interface representing information about a student, including their name, grade, school, and the supplies they have requested.
export interface StudentInfo {
  name: string;
  grade: string;
  school: string;
  requestedSupplies: string[];
}

// An interface representing a family, including the guardian's name, email, address, time slot for pickup, and an array of students.
export interface AvailabilityOptions {
  earlyMorning: boolean;
  lateMorning: boolean;
  earlyAfternoon: boolean;
  lateAfternoon: boolean;
}

export interface Family {
  _id?: string;
  guardianName: string;
  email: string;
  address: string;
  timeSlot: string;
  students: StudentInfo[];
  timeAvailability: AvailabilityOptions;
}

// An interface representing statistics for the dashboard, including counts of students per school and grade, as well as the total number of families served.
export interface DashboardStats {
  studentsPerSchool: { [school: string]: number };
  studentsPerGrade: { [grade: string]: number };
  totalFamilies: number;
}
