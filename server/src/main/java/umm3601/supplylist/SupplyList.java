// Packages
// noinspection SpellCheckingInspection
package umm3601.supplylist;

// Org Imports
import org.mongojack.Id;
import org.mongojack.ObjectId;

// Supply List Class
@SuppressWarnings({ "VisibilityModifier" })
public class SupplyList {

  @ObjectId @Id
  @SuppressWarnings({ "MemberName" })
  public String _id; // MongoDB ObjectId stored as a string

  // Inventory fields
  public String school;
  public String grade;
  public String teacher;
  public String item;
  public String brand;
  public int count;
  public String size;
  public String color;
  public String type;
  public String material;
  public String description;
  public int quantity;
  public String notes;

  // Override equals and hashCode for proper comparison and hashing based on _id
  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof SupplyList)) {
      return false;
    }
    SupplyList other = (SupplyList) obj;
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
    StringBuilder sb = new StringBuilder();

    // Quantity
    sb.append(quantity).append("x ");

    // Count
    if (count > 0) {
      sb.append(count).append("ct. ");
    }

    // Size
    if (size != null && !size.isEmpty()) {
      sb.append(size);
      if (quantity > 1) {
        sb.append("s");
      }
      sb.append(" of ");
    }

    // Item (pluralize if quantity > 1)
    if (item != null && !item.isEmpty()) {
      sb.append(item);
      // Pluralize if needed
      if (quantity > 1 && !item.endsWith("s")) {
        sb.append("s");
      }
      sb.append(" ");
    }

    // Brand
    if (brand != null && !brand.isEmpty()) {
      sb.append(brand).append(" ");
    }

    // Color
    if (color != null && !color.isEmpty()) {
      sb.append(color).append(" ");
    }

    // Type
    if (type != null && type.length() > 0) {
      sb.append(String.join(", ", type)).append(" ");
    }

    // Material
    if (material != null && material.length() > 0) {
      sb.append(String.join(", ", material)).append(" ");
    }

    // Notes
    if (notes != null && !notes.isEmpty()) {
      sb.append("- ").append(notes);
    }

    return sb.toString().trim();
  }
}
