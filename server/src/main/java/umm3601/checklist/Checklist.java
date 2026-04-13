package umm3601.checklist;

import java.util.List;

import umm3601.supplylist.SupplyList;



@SuppressWarnings({"VisibilityModifier"})
class Checklist {
  public String studentName;
  public String school;
  public String grade;
  public List<String> requestedSupplies;
  public List<Checklist.ChecklistItem> checklist;

  public static class ChecklistItem {
    public String itemName;
    public Boolean completed = false; //needs coverage
    public Boolean unreceived = false; //needs coverage
    public String selectedOption;

     ChecklistItem(SupplyList supply) { //needs coverage
      this.itemName = supply.item;            //needs coverage
    }
  }
}

