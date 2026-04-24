// Packages
package umm3601.purchaselist;

// Java Imports
import java.util.List;

import org.mongojack.Id;
import org.mongojack.ObjectId;

import umm3601.supplylist.SupplyList;
import umm3601.inventory.Inventory;

@SuppressWarnings({"VisibilityModifier"})
public class Purchaselist {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String item;
  public String brand;
  public String size;
  public String color;
  public List<String> requestedSupplies;  //how did this work for Checklist? Do I do inventory and supply?
  public List<PurchaselistItem> purchaselist; //Is this useful or not for purchase?

  // Default constructor for Jackson serialization
  public Purchaselist() {
  }

  public static class PurchaselistItem {
    public SupplyList supply;
    public Inventory item;
    public Boolean completed = false;
    public Boolean unreceived = false;
    public String selectedOption;

    public PurchaselistItem() {
      // No-arg constructor for deserialization
    }

    PurchaselistItem(SupplyList supply) {
      this.supply = supply;
    }

    PurchaselistItem(Inventory item) {
      this.item = item;
    }
  }

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
