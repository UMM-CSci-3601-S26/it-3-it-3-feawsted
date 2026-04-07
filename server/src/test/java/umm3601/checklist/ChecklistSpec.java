package umm3601.checklist;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import umm3601.supplylist.SupplyList;

class ChecklistSpec {
  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private Checklist checklist1;
  private Checklist checklist2;

  @BeforeEach
  void setupEach() {
    checklist1 = new Checklist();
    checklist2 = new Checklist();

    SupplyList supply1 = new SupplyList();
    supply1.item = "Pencil";
    supply1.brand = "Ticonderoga";
    supply1.description = "Ticonderoga Pencil";

    checklist1.studentName = "Joe";
    checklist1.grade = "1";
    checklist1.school = "Morris";
    checklist1.requestedSupplies = List.of("Backpack");
    checklist1.checklist = List.of(new Checklist.ChecklistItem(supply1));
  }

  @Test
  void checklistsWithEqualIdAreEqual() {
    checklist1._id = FAKE_ID_STRING_1;
    checklist2._id = FAKE_ID_STRING_1;

    assertTrue(checklist1.equals(checklist2));
  }

  @Test
  void checklistsWithDifferentIdAreNotEqual() {
    checklist1._id = FAKE_ID_STRING_1;
    checklist2._id = FAKE_ID_STRING_2;

    assertFalse(checklist1.equals(checklist2));
  }

  @Test
  void checklistDoesNotEqualNonChecklist() {
    Checklist checklist = new Checklist();
    Object nonChecklist = "abc123";

    assertFalse(checklist.equals(nonChecklist));
  }

  @Test
  void checklistsWithNullIdAreNotEqual() {
    checklist1._id = null;
    checklist2._id = FAKE_ID_STRING_1;

    assertFalse(checklist1.equals(checklist2));
  }

  @Test
  void hashCodesAreBasedOnId() {
    checklist1._id = FAKE_ID_STRING_1;
    checklist2._id = FAKE_ID_STRING_1;

    assertTrue(checklist1.hashCode() == checklist2.hashCode());
  }

  @SuppressWarnings("unlikely-arg-type")
  @Test
  void checklistsAreNotEqualToOtherKindsOfThings() {
    checklist1._id = FAKE_ID_STRING_1;
    // a Checklist is not equal to its id even though id is used for checking equality
    assertFalse(checklist1.equals(FAKE_ID_STRING_1));
  }

  @Test
  void nullId() {
    checklist1._id = null;
    checklist2._id = FAKE_ID_STRING_2;

    assertEquals(checklist1.hashCode(), 0);
    assertFalse(checklist1.equals(checklist2));
  }

  @Test
  void fieldsCanBeAssignedAndRead() {

    assertEquals("Joe", checklist1.studentName);
    assertEquals("1", checklist1.grade);
    assertEquals("Morris", checklist1.school);
    assertEquals(List.of("Backpack"), checklist1.requestedSupplies);
    assertEquals(1, checklist1.checklist.size());
    assertEquals("Pencil", checklist1.checklist.get(0).supply.item);
    assertEquals("Ticonderoga", checklist1.checklist.get(0).supply.brand);
    assertEquals("Ticonderoga Pencil", checklist1.checklist.get(0).supply.description);
  }
}
