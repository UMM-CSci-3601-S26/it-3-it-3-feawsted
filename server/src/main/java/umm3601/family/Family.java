package umm3601.family;

import java.util.List;

import org.mongojack.Id;
import org.mongojack.ObjectId;

/**
 * The Family model represents a single household registering for school supplies.
 *
 * Each Family document contains:
 *  - Guardian contact info
 *  - A list of students in the household
 *  - Each student's grade, school, and requested supplies
 *
 * Families register together, so storing them as a single MongoDB document
 * keeps reads simple and avoids joins.
 */

@SuppressWarnings({"VisibilityModifier"})
public class Family {

  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id; // MongoDB ObjectId stored as a string

  // Guardian-level information (applies to the whole household)
  public String guardianName;
  public String email;
  public String address;
  public String timeSlot;

  // Students are embedded inside the Family document.
  public List<StudentInfo> students;

  // Represents a single student within a family.
  public static class StudentInfo {
    public String name;
    public String grade;
    public String school;
    public List<String> requestedSupplies;
  }
}
