// Packages
package umm3601.checklist;

// Java Imports
import java.util.List;

import org.mongojack.Id;
import org.mongojack.ObjectId;

// Misc Imports
import umm3601.supplylist.SupplyList;

// Checklist Class
@SuppressWarnings({ "VisibilityModifier" })
class Checklist {

  // Defined first because the Checklist fields below reference this type.
  public static class ChecklistItem {
    // Full supply details kept for filtering/inventory purposes
    public SupplyList supply;

    // Null means the field was never set (e.g. freshly created or old record).
    // False means explicitly marked not done. True means done.
    public Boolean completed;   // Volunteer marked this as given
    public Boolean unreceived;  // Supply ran out — needs delivery to school

    // Which option the user selected for this item, if any
    public String selectedOption;

    // Required by Jackson for deserialization from MongoDB
    ChecklistItem() {
    }

    // Creates a checklist item from a supply item with an explicit initial state
    ChecklistItem(SupplyList supply) {
      this.supply = supply;
      this.completed = false;
      this.unreceived = false;
      this.selectedOption = null;
    }
  }

  // Checklist document fields
  @ObjectId @Id
  @SuppressWarnings({ "MemberName" })
  public String _id;
  public String studentName;
  public String school;
  public String grade;
  public List<String> requestedSupplies;
  public List<ChecklistItem> checklist;

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
