// Packages
package umm3601.checklist;

// Java Imports
import java.util.List;

import org.mongojack.Id;
import org.mongojack.ObjectId;

import umm3601.supplylist.SupplyList;

@SuppressWarnings({"VisibilityModifier"})
public class Checklist {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String studentName;
  public String school;
  public String grade;
  public List<String> requestedSupplies;
  public List<ChecklistItem> checklist;

  // Default constructor for Jackson serialization
  public Checklist() {
  }

  public static class ChecklistItem {
    public SupplyList supply;
    public Boolean completed = false;
    public Boolean unreceived = false;
    public String selectedOption;

    public ChecklistItem() {
      // No-arg constructor for deserialization
    }

    ChecklistItem(SupplyList supply) {
      this.supply = supply;
    }
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (!(obj instanceof Checklist)) {
      return false;
    }
    Checklist other = (Checklist) obj;
    return this._id != null && this._id.equals(other._id);
  }

  @Override
  public int hashCode() {
    return _id != null ? _id.hashCode() : 0;
  }
}
