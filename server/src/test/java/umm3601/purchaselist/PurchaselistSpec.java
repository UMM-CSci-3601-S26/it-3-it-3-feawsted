package umm3601.purchaselist;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

@SuppressWarnings({ "MagicNumber" })
class PurchaselistSpec {

  @Test
  void purchaselistFieldsCanBeAssignedAndRead() {
    Purchaselist p = new Purchaselist();

    p.item = "Pencils";
    p.description = "No. 2 pencils";
    p.needQuantity = 40;
    p.inventoryQuantity = 12;
    p.purchaseQuantity = 28;

    assertEquals("Pencils", p.item);
    assertEquals("No. 2 pencils", p.description);
    assertEquals(40, p.needQuantity);
    assertEquals(12, p.inventoryQuantity);
    assertEquals(28, p.purchaseQuantity);
  }

  @Test
  void purchaselistEqualityUsesId() {
    Purchaselist p1 = new Purchaselist();
    Purchaselist p2 = new Purchaselist();
    Purchaselist p3 = new Purchaselist();

    p1._id = "abc123";
    p2._id = "abc123";
    p3._id = "xyz789";

    assertEquals(p1, p2);
    assertNotEquals(p1, p3);
    assertNotEquals(p2, p3);
  }

  @Test
  void purchaselistHashCodeUsesId() {
    Purchaselist p1 = new Purchaselist();
    Purchaselist p2 = new Purchaselist();

    p1._id = "id123";
    p2._id = "id123";

    assertEquals(p1.hashCode(), p2.hashCode());
  }

  @Test
  void purchaselistWithNullIdIsNotEqualToOneWithId() {
    Purchaselist p1 = new Purchaselist();
    Purchaselist p2 = new Purchaselist();

    p1._id = null;
    p2._id = "something";

    assertNotEquals(p1, p2);
  }

  @Test
  void purchaselistWithBothNullIdsAreNotEqual() {
    Purchaselist p1 = new Purchaselist();
    Purchaselist p2 = new Purchaselist();

    p1._id = null;
    p2._id = null;

    assertNotEquals(p1, p2);
  }
}
