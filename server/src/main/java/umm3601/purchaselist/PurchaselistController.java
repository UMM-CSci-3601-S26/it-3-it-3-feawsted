//Packages
package umm3601.purchaselist;

// Static imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// Java Imports
import java.io.File;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

// Org Imports
import org.mongojack.JacksonMongoCollection;
import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;

// Com Imports
import com.mongodb.client.model.Filters;
import com.mongodb.client.MongoDatabase;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

// Misc Imports
import umm3601.Controller;
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.purchaselist.Purchaselist;
import umm3601.settings.Settings;
import umm3601.settings.SettingsController;
import umm3601.inventory.Inventory;
import umm3601.checklist.Checklist;

public class PurchaselistController implements Controller {

  private static final String API_PURCHASELIST = "/api/purchaselist";

  // static final String ITEM_KEY = "item";
  // static final String DESC_KEY = "description";
  // static final String NEED_QUANTITY_KEY = "needQuantity";
  // static final String INVENTORY_QUANTITY_KEY = "inventoryQuantity";
  // static final String PURCHASE_QUANTITY_KEY = "purchaseQuantity";

  private final JacksonMongoCollection<Checklist> checklistCollection;
  private final JacksonMongoCollection<Inventory> inventoryCollection;

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
        if (checklistItem.supply == null ||
            checklistItem.supply.item == null ||
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
      purchaselist.description = ""; // optional: fill from supply list if you have descriptions
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
// //Packages
// package umm3601.purchaselist;

// // Static imports
// import static com.mongodb.client.model.Filters.and;
// import static com.mongodb.client.model.Filters.eq;
// import static com.mongodb.client.model.Filters.regex;

// import java.io.File;
// // Java Imports
// import java.util.ArrayList;
// import java.util.Comparator;
// import java.util.HashMap;
// import java.util.HashSet;
// import java.util.List;
// import java.util.Map;
// import java.util.Objects;
// import java.util.Set;
// import java.util.regex.Pattern;
// import java.util.stream.Collectors;

// import org.bson.Document;
// import org.bson.UuidRepresentation;
// import org.bson.conversions.Bson;
// // Org Imports
// import org.mongojack.JacksonMongoCollection;

// import com.fasterxml.jackson.core.type.TypeReference;
// import com.fasterxml.jackson.databind.ObjectMapper;
// // Com Imports
// // import com.mongodb.client.model.Filters;
// import com.mongodb.client.MongoDatabase;

// // IO Imports
// import io.javalin.Javalin;
// import io.javalin.http.BadRequestResponse;
// import io.javalin.http.Context;
// import io.javalin.http.HttpStatus;
// import io.javalin.http.NotFoundResponse;
// // Misc Imports
// import umm3601.Controller;
// import umm3601.family.Family;
// import umm3601.family.Family.StudentInfo;
// import umm3601.purchaselist.Purchaselist;
// import umm3601.settings.Settings;
// import umm3601.settings.SettingsController;
// import umm3601.inventory.Inventory;
// import umm3601.checklist.Checklist;

// //Purchase list info for bottom code

// // class Item {
// // public String item;
// // public String brand;
// // public String size;
// // public String color;
// // public int quantity;
// // public String notes;

// // @Override
// // public boolean equals(Object o) {
// // if (this == o) return true;
// // if (!(o instanceof Item)) return false;
// // Item other = (Item) o;

// // return Objects.equals(item, other.item) &&
// // Objects.equals(brand, other.brand) &&
// // Objects.equals(size, other.size) &&
// // Objects.equals(color, other.color);
// // }

// // @Override
// // public int hashCode() {
// // return Objects.hash(item, brand, size, color);
// // }
// // }

// public class PurchaselistController implements Controller {

// private static final String API_PURCHASELIST = "/api/purchaselist";
// // // private static final String API_PURCHASELIST_PRINT =
// "/api/purchaselists/print";

// // static final String ITEM_KEY = "item"; //any given item needed
// // static final String DESC_KEY = "description";
// // static final String NEED_QUANTITY_KEY = "needQuantity"; //quantity of the
// given item needed, based on checklists
// // static final String INVENTORY_QUANTITY_KEY = "inventoryQuantity";
// //quantity of the given item in inventory
// // static final String PURCHASE_QUANTITY_KEY = "purchaseQuantity"; //quantity
// of the given item to purchase (need - inventory)

// // private final JacksonMongoCollection<Family> familyCollection;
// // private final JacksonMongoCollection<Checklist> checklistCollection;
// // private final JacksonMongoCollection<Inventory> inventoryCollection;

// // // constructor used for testing:database/seed/
// // public PurchaselistController(JacksonMongoCollection<Family>
// familyCollection, JacksonMongoCollection<Checklist> checklistCollection,
// JacksonMongoCollection<Inventory> inventoryCollection) {
// // this.familyCollection = familyCollection;
// // this.checklistCollection = checklistCollection;
// // this.inventoryCollection = inventoryCollection;
// // }

// // // constructor used in server:
// // public PurchaselistController(MongoDatabase db) {
// // checklistCollection = JacksonMongoCollection.builder().build(
// // db, "checklist", Checklist.class, UuidRepresentation.STANDARD);
// // inventoryCollection = JacksonMongoCollection.builder().build(
// // db, "inventory", Inventory.class, UuidRepresentation.STANDARD);
// // }

// // //create a needs list before making purchaselist
// // public Map<Item, Integer> calculateNeeds(List<Checklist> checklists) {
// // Map<Item, Integer> totals = new HashMap<>();

// // for (Checklist checklist : checklists){
// // for (Checklist.ChecklistItem ci : checklist.checklist) {

// // if (ci.supply == null) continue;

// // Item key = new Item();

// // key.size = ci.supply.size;
// // // key.color = ci.supply.color;

// // int quantity = ci.supply.quantity > 0 ? ci.supply.quantity : 1;

// // totals.put(key, totals.getOrDefault(key, 0) + quantity);

// // }
// // }

// // return totals;
// // }

// // //Purchase compare code
// // public static List<Item> getPurchaselist(String inventoryCollection,
// String checklistCollection) throws Exception { //The compare(strings) should
// be relating to inventory and checklist, is there better method?
// // ObjectMapper mapper = new ObjectMapper();

// // List<Item> inventory = mapper.readValue(
// // new File("inventory.json"),
// // new TypeReference<List<Item>>() {}
// // );

// // List<Item> checklist = mapper.readValue(
// // new File("checklist"),
// // new TypeReference<List<Item>>() {}
// // );

// // Set<Item> inventorySet = new HashSet<>(inventory);

// // List<Item> missingItems = new ArrayList<>();

// // for (Item item : checklist) {
// // if (!inventorySet.contains(item)) {
// // missingItems.add(item);
// // }}
// // return missingItems;
// // }

// // /**
// // * GET /api/checklist/{id}
// // * Retrieves a single supply list item by its MongoDB ObjectId.
// // */
// // public void getList(Context ctx) {
// // String id = ctx.pathParam("id");
// // Checklist checklistinv;

// // try {
// // checklistinv = checklistCollection.find(eq("_id", new
// ObjectId(id))).first();
// // } catch (IllegalArgumentException e) {
// // throw new BadRequestResponse("The requested supply list id wasn't a legal
// Mongo Object ID.");
// // }

// // if (checklistinv == null) {
// // throw new NotFoundResponse("The requested supply list item was not
// found");
// // } else {
// // ctx.json(checklistinv);
// // ctx.status(HttpStatus.OK);
// // }
// // }

// @Override
// public void addRoutes(Javalin server) {
// // Digital drive-day routes (persisted)

// }
