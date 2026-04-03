package umm3601.checklist;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;


import org.junit.jupiter.api.Test;

class ChecklistSpec {
  private Checklist checklist;

  // @Test
  // void toStringIncludesKeyFields() {
  //   Checklist c = new Checklist();
  //   c.studentName = "Joe";
  //   c.school = "Morris";
  //   c.grade = "1";
  //   c.requestedSupplies = List.of("Backpack");

  //   String result = c.toString();

  //   assertTrue(result.contains("Joe"));
  //   assertTrue(result.contains("Morris"));
  //   assertTrue(result.contains("1"));
  // }

  // @Test
  // void checklistListCanBeAssignedAndRead() {
  //   Checklist c = new Checklist();

  //   Checklist.ChecklistItem item1 = new Checklist.ChecklistItem();
  //   item1.itemName = "Notebook";

  //   Checklist.ChecklistItem item2 = new Checklist.ChecklistItem();
  //   item2.itemName = "Pencil";

  //   c.checklist = List.of(item1, item2);

  //   assertEquals(2, c.checklist.size());
  //   assertEquals("Notebook", c.checklist.get(0).itemName);
  //   assertEquals("Pencil", c.checklist.get(1).itemName);
  // }

  // @Test
  // void checklistItemBooleanDefaultsAndAssignment() {
  //   Checklist.ChecklistItem item = new Checklist.ChecklistItem();

  //   assertFalse(item.completed);
  //   assertFalse(item.unreceived);

  //   item.completed = true;
  //   item.unreceived = true;

  //   assertTrue(item.completed);
  //   assertTrue(item.unreceived);
  // }

  // @Test
  // void checklistItemConstructorCopiesItemName() {
  //   SupplyList supply = new SupplyList();
  //   supply.item = "Pencil";

  //   Checklist.ChecklistItem item = new Checklist.ChecklistItem(supply);

  //   assertEquals("Pencil", item.itemName);
  // }

  @Test
  void fieldsCanBeAssignedAndRead() {
    Checklist c = new Checklist();

    c.studentName = "Joe";
    c.grade = "1";
    c.school = "Morris";
    c.requestedSupplies = List.of("Backpack");
    //c.checklist = "Notebook, Crayola, Wide ruled";

    assertEquals("Joe", c.studentName);
    assertEquals("1", c.grade);
    assertEquals("Morris", c.school);
    assertEquals(List.of("Backpack"), c.requestedSupplies);
    //assertEquals("Notebook, Crayola, Wide ruled", c.checklist);
  }
}
