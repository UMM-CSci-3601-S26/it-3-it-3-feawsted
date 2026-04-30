//Packages
package umm3601.purchaselist;

// Java Imports
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Org Imports
import org.mongojack.JacksonMongoCollection;
import org.bson.UuidRepresentation;

// Com Imports
import com.mongodb.client.MongoDatabase;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

// Misc Imports
import umm3601.Controller;
import umm3601.inventory.Inventory;
import umm3601.checklist.Checklist;

public class PurchaselistController implements Controller {

  private static final String API_PURCHASELIST = "/api/purchaselist";
  private static final String API_CHECKLIST = "/api/checklist";

  // static final String ITEM_KEY = "item";
  // static final String DESC_KEY = "description";
  // static final String NEED_QUANTITY_KEY = "needQuantity";
  // static final String INVENTORY_QUANTITY_KEY = "inventoryQuantity";
  // static final String PURCHASE_QUANTITY_KEY = "purchaseQuantity";

  private final JacksonMongoCollection<Checklist> checklistCollection;
  private final JacksonMongoCollection<Inventory> inventoryCollection;

  // constructor used for testing
  public PurchaselistController(
    JacksonMongoCollection<Checklist> checklistCollection,
    JacksonMongoCollection<Inventory> inventoryCollection) {

  this.checklistCollection = checklistCollection;
  this.inventoryCollection = inventoryCollection;
}

  public PurchaselistController(MongoDatabase db) {
    checklistCollection = JacksonMongoCollection.builder().build(
        db, "checklists", Checklist.class, UuidRepresentation.STANDARD);
    inventoryCollection = JacksonMongoCollection.builder().build(
        db, "inventory", Inventory.class, UuidRepresentation.STANDARD);
  }

  // Normalizes a school name for matching: lowercase, strip trailing " school"
  // static String normalizeChecklistItems(String s) {
  // if (s == null) {
  // return "";
  // }
  // return s.trim().toLowerCase().replaceAll("\\s.school$", "");
  // }

  // // Normalizes a grade for matching: lowercase, remove hyphens and spaces
  // static String normalizeGrade(String g) {
  // if (g == null) {
  // return "";
  // }
  // return g.trim().toLowerCase().replaceAll("[\\s\\-]", "");
  // }



  public void getPurchaselist(Context ctx) {

    // Load all checklist and inventory documents
    List<Checklist> checklists = checklistCollection.find().into(new ArrayList<>());
    System.out.println("CHECKLIST SIZE: " + checklists.size());
    List<Inventory> inventory = inventoryCollection.find().into(new ArrayList<>());

    System.out.println("CHECKLIST COUNT: " + checklists.size());
    System.out.println("INVENTORY COUNT: " + inventory.size());

    // Maps: itemName → quantity
    Map<String, Integer> needMap = new HashMap<>();
    Map<String, Integer> inventoryMap = new HashMap<>();

    // Build inventory map
    for (Inventory inv : inventory) {
      if (inv.item != null && !inv.item.isEmpty()) {
        String key = inv.item.toLowerCase().trim();
        inventoryMap.put(key, inv.quantity);
      }
    }
    System.out.println("INVENTORY KEYS: " + inventoryMap.keySet());

    // Build need map from checklists
    for (Checklist checklist : checklists) {
      if (checklist.checklist == null) {
        System.out.println("CHECKLIST.ITEMS IS NULL for " + checklist._id);
        continue;
      }

      for (Checklist.ChecklistItem checklistItem : checklist.checklist) {
        System.out.println("CHECKLIST ITEM FOUND");
        if (checklistItem.supply == null
        ||
            checklistItem.supply.item == null
            ||
            checklistItem.supply.item.isEmpty()) {
          continue;
        }

        String itemName = checklistItem.supply.item.get(0)
            .toLowerCase()
            .trim();
        System.out.println("CHECKLIST ITEM: " + itemName);
        System.out.println("ITEM NAME: " + itemName);
        int quantityNeeded = checklistItem.supply.quantity > 0 ? checklistItem.supply.quantity : 1;

        needMap.merge(itemName, quantityNeeded, Integer::sum);
        System.out.println("NEED MAP SIZE: " + needMap.size());
        System.out.println("NEED MAP: " + needMap);
      }
    }

    // Build purchaselist results
    List<Purchaselist> result = new ArrayList<>();

    for (String itemName : needMap.keySet()) {
      int needQuantity = needMap.get(itemName);
      int invQuantity = inventoryMap.getOrDefault(itemName, 0);
      int purchaseQuantity = Math.max(needQuantity - invQuantity, 0);

      Purchaselist purchaselist = new Purchaselist();
      purchaselist.item = itemName;
      purchaselist.description = "";
      purchaselist.needQuantity = needQuantity;
      purchaselist.inventoryQuantity = invQuantity;
      purchaselist.purchaseQuantity = purchaseQuantity;

      result.add(purchaselist);
    }

    ctx.json(result);
    ctx.status(HttpStatus.OK);
  }

  @Override
  public void addRoutes(Javalin server) {
    // Digital drive-day routes (persisted)
    server.get(API_PURCHASELIST, this::getPurchaselist);

  }
}
