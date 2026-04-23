package umm3601.purchaselist;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import umm3601.supplylist.SupplyList;
import umm3601.inventory.Inventory;

// class PurchaselistSpec {
//   private static final String FAKE_ID_STRING_1 = "fakeIdOne";
//   private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

//   private Purchaselist purchaselist1;
//   private Purchaselist purchaselist2;

//   @BeforeEach
//   void setupEach() {
//     purchaselist1 = new Purchaselist();
//     purchaselist2 = new Purchaselist();

//     SupplyList supply1 = new SupplyList();
//     supply1.item = Arrays.asList("Pencil");
//     supply1.brand = new SupplyList.AttributeOptions();
//     supply1.brand.allOf = Arrays.asList("Ticonderoga");

//     purchaselist1.studentName = "Joe";
//     purchaselist1.grade = "1";
//     purchaselist1.school = "Morris";
//     purchaselist1.requestedSupplies = List.of("Backpack");
//     purchaselist1.purchaselist = List.of(new Purchaselist.PurchaselistItem(supply1));
//   }

//   @Test
//   void purchaselistsWithEqualIdAreEqual() {
//     purchaselist1._id = FAKE_ID_STRING_1;
//     purchaselist2._id = FAKE_ID_STRING_1;

//     assertTrue(purchaselist1.equals(purchaselist2));
//   }

//   @Test
//   void purchaselistsWithDifferentIdAreNotEqual() {
//     purchaselist1._id = FAKE_ID_STRING_1;
//     purchaselist2._id = FAKE_ID_STRING_2;

//     assertFalse(purchaselist1.equals(purchaselist2));
//   }

//   @Test
//   void purchaselistDoesNotEqualNonPurchaselist() {
//     Purchaselist purchaselist = new Purchaselist();
//     Object nonPurchaselist = "abc123";

//     assertFalse(purchaselist.equals(nonPurchaselist));
//   }

//   @Test
//   void purchaselistsWithNullIdAreNotEqual() {
//     purchaselist1._id = null;
//     purchaselist2._id = FAKE_ID_STRING_1;

//     assertFalse(purchaselist1.equals(purchaselist2));
//   }

//   @Test
//   void hashCodesAreBasedOnId() {
//     purchaselist1._id = FAKE_ID_STRING_1;
//     purchaselist2._id = FAKE_ID_STRING_1;

//     assertTrue(purchaselist1.hashCode() == purchaselist2.hashCode());
//   }

//   @SuppressWarnings("unlikely-arg-type")
//   @Test
//   void purchaselistsAreNotEqualToOtherKindsOfThings() {
//     purchaselist1._id = FAKE_ID_STRING_1;
//     // a Purchaselist is not equal to its id even though id is used for checking equality
//     assertFalse(purchaselist1.equals(FAKE_ID_STRING_1));
//   }

//   @Test
//   void nullId() {
//     purchaselist1._id = null;
//     purchaselist2._id = FAKE_ID_STRING_2;

//     assertEquals(purchaselist1.hashCode(), 0);
//     assertFalse(purchaselist1.equals(purchaselist2));
//   }

//   @Test
//   void fieldsCanBeAssignedAndRead() {

//     assertEquals("Joe", purchaselist1.studentName);
//     assertEquals("1", purchaselist1.grade);
//     assertEquals("Morris", purchaselist1.school);
//     assertEquals(List.of("Backpack"), purchaselist1.requestedSupplies);
//     assertEquals(1, purchaselist1.purchaselist.size());
//     assertTrue(purchaselist1.purchaselist.get(0).supply.item.contains("Pencil"));
//     assertTrue(purchaselist1.purchaselist.get(0).supply.brand.allOf.contains("Ticonderoga"));
//   }
// }
