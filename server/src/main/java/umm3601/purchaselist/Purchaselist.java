// Packages
package umm3601.purchaselist;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Purchaselist {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String item;
  public String description;
  public int needQuantity;
  public int inventoryQuantity;
  public int purchaseQuantity;
  //public String priority;


  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (!(obj instanceof Purchaselist)) {
      return false;
    }
    Purchaselist other = (Purchaselist) obj;
    return this._id != null && this._id.equals(other._id);
  }

  @Override
  public int hashCode() {
    return _id != null ? _id.hashCode() : 0;
  }
}
