// Packages
// noinspection SpellCheckingInspection
package umm3601.supplylist;

import java.util.List;

// Org Imports
import org.mongojack.Id;
import org.mongojack.ObjectId;

// Supply List Class
@SuppressWarnings({ "VisibilityModifier" })
public class SupplyList {

  @ObjectId @Id
  @SuppressWarnings({ "MemberName" })
  public String _id; // MongoDB ObjectId stored as a string

  // Supply list fields
  public String district;
  public String school;
  public String grade;
  public String teacher;
  public String academicYear;
  public List<String> item;
  public AttributeOptions brand;
  public String size;
  public AttributeOptions color;
  public AttributeOptions type;
  public AttributeOptions style;
  public AttributeOptions material;
    // Helper class for allOf/anyOf attributes
    public static class AttributeOptions {
      public List<String> allOf;
      public List<String> anyOf;
    }
  public int count;
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
    if (quantity > 0) {
      sb.append(quantity).append(" ");
    }

    // Count (e.g., 24ct)
    if (count > 1) {
      sb.append(count).append("ct ");
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
      sb.append(String.join(" or ", item));
      // Pluralize if needed
      if (quantity > 1 && item.size() == 1 && !item.get(0).endsWith("s")) {
        sb.append("s");
      }
      sb.append(" ");
    }

    // Format allOf/anyOf for each attribute
    String allOfStr = formatAllOf(type, "");
    allOfStr += formatAllOf(color, allOfStr.isEmpty() ? "" : ", ");
    allOfStr += formatAllOf(brand, allOfStr.isEmpty() ? "" : ", ");
    allOfStr += formatAllOf(material, allOfStr.isEmpty() ? "" : ", ");
    allOfStr += formatAllOf(style, allOfStr.isEmpty() ? "" : ", ");
    if (!allOfStr.isEmpty()) {
      sb.append(allOfStr);
    }

    // Format anyOf for each attribute (grouped by category)
    String anyOfStr = formatAnyOf(type);
    anyOfStr += formatAnyOf(color);
    anyOfStr += formatAnyOf(brand);
    anyOfStr += formatAnyOf(material);
    anyOfStr += formatAnyOf(style);
    if (!anyOfStr.isEmpty()) {
      sb.append(anyOfStr);
    }

    // Notes
    if (notes != null && !notes.isEmpty()) {
      sb.append(" (").append(notes).append(")");
    }

    return sb.toString().trim();
  }

  // Helper to format allOf as comma-separated with 'and' before last
  private String formatAllOf(AttributeOptions attr, String prefix) {
    if (attr == null || attr.allOf == null || attr.allOf.isEmpty()) {
      return "";
    }
    StringBuilder sb = new StringBuilder(prefix);
    int n = attr.allOf.size();
    for (int i = 0; i < n; i++) {
      sb.append(attr.allOf.get(i));
      if (i < n - 2) {
        sb.append(", ");
      } else if (i == n - 2) {
        sb.append(", and ");
      }
    }
    return sb.toString();
  }

  // Helper to format anyOf as (a, b, or c) per category
  private String formatAnyOf(AttributeOptions attr) {
    if (attr == null || attr.anyOf == null || attr.anyOf.isEmpty()) {
      return "";
    }
    StringBuilder sb = new StringBuilder(" (");
    int n = attr.anyOf.size();
    for (int i = 0; i < n; i++) {
      sb.append(attr.anyOf.get(i));
      if (i < n - 2) {
        sb.append(", ");
      } else if (i == n - 2) {
        sb.append(", or ");
      }
    }
    sb.append(")");
    return sb.toString();
  }
}
