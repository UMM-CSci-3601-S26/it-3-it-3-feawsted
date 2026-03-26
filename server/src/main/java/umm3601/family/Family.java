// Packages
package umm3601.family;

// Static Imports
import java.util.List;

// Org Imports
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

  // Override equals and hashCode for proper comparison and hashing based on _id
  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof Family)) {
      return false;
    }
    Family other = (Family) obj;
    return _id != null && _id.equals(other._id);
  }

  // Hash code based on _id for use in hash-based collections
  @Override
  public int hashCode() {
    return _id == null ? 0 : _id.hashCode();
  }

  // Override toString for easier debugging and logging
  @Override
  public String toString() {
    return guardianName + " " + email + " " + address;
  }
}
