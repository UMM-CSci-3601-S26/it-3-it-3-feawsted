package umm3601.inventory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@SuppressWarnings({ "MagicNumber" })
public class InventorySpec {

  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private Inventory inv1;
  private Inventory inv2;

  @BeforeEach
  void setupEach() {
    inv1 = new Inventory();
    inv2 = new Inventory();

    inv1.item = "Pencil";
    inv1.brand = "Ticonderoga";
  }

  // -------------------------
  // equals / hashCode tests
  // -------------------------

  @Test
  void inventoriesWithEqualIdAreEqual() {
    inv1._id = FAKE_ID_STRING_1;
    inv2._id = FAKE_ID_STRING_1;

    assertTrue(inv1.equals(inv2));
  }

  @Test
  void inventoriesWithDifferentIdAreNotEqual() {
    inv1._id = FAKE_ID_STRING_1;
    inv2._id = FAKE_ID_STRING_2;

    assertFalse(inv1.equals(inv2));
  }

  @Test
  void inventoryNotEqualToNonInventoryObject() {
    inv1._id = FAKE_ID_STRING_1;
    assertFalse(inv1.equals("fakeIdOne"));
  }

  @Test
  void inventoriesWithNullIdsAreNotEqual() {
    inv1._id = null;
    inv2._id = null;

    assertFalse(inv1.equals(inv2));
  }

  @Test
  void inventoryNullIdEqualsNonNullIdIsFalse() {
    inv1._id = null;
    inv2._id = FAKE_ID_STRING_1;

    assertFalse(inv1.equals(inv2));
  }

  @Test
  void hashCodesAreEqualWhenIdsAreEqual() {
    inv1._id = FAKE_ID_STRING_1;
    inv2._id = FAKE_ID_STRING_1;

    assertEquals(inv1.hashCode(), inv2.hashCode());
  }

  @Test
  void nullIdHashCodeIsZero() {
    inv1._id = null;
    assertEquals(0, inv1.hashCode());
  }

  // -------------------------
  // toString tests
  // -------------------------

  @Test
  void toStringOutOfStockBasic() {
    // quantity = 0 (default)
    assertEquals("Out of stock: Pencil Ticonderoga", inv1.toString());
  }

  @Test
  void toStringWithQuantityAndCountAndFullFields() {
    Inventory inv = new Inventory();

    inv.quantity = 2;
    inv.count = 3;
    inv.size = "Large";
    inv.item = "Pencil";
    inv.brand = "Ticonderoga";
    inv.color = "Red";
    inv.type = new String[]{"writing", "school"};
    inv.style = new String[]{"HB"};
    inv.material = new String[]{"wood", "graphite"};
    inv.notes = "sharpened";

    String expected =
        "2 3ct. Larges of Pencils Ticonderoga Red writing, school HB wood, graphite - sharpened";

    assertEquals(expected, inv.toString());
  }

  @Test
  void toStringHandlesEmptyOptionalFields() {
    Inventory inv = new Inventory();

    inv.quantity = 1;
    inv.count = 0;
    inv.size = "";
    inv.item = "Notebook";
    inv.brand = "";
    inv.color = "";
    inv.type = new String[] {};
    inv.style = null;
    inv.material = null;
    inv.notes = "";

    String expected = "1 Notebook";

    assertEquals(expected, inv.toString());
  }

  @Test
  void toStringHandlesNullFieldsGracefully() {
    Inventory inv = new Inventory();

    inv.quantity = 1;
    inv.item = "Eraser";
    inv.brand = null;
    inv.color = null;
    inv.size = null;
    inv.notes = null;

    String expected = "1 Eraser";

    assertEquals(expected, inv.toString());
  }

  @Test
  void toStringHandlesSizeAndPluralization() {
    Inventory inv = new Inventory();

    inv.quantity = 3;
    inv.size = "Small";
    inv.item = "Box";

    String expected = "3 Smalls of Boxs";

    assertEquals(expected, inv.toString());
  }
}
