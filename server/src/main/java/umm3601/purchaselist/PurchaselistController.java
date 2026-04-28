//Packages
package umm3601.purchaselist;

// Static imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.io.File;
// Java Imports
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

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
// Org Imports
import org.mongojack.JacksonMongoCollection;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
// Com Imports
// import com.mongodb.client.model.Filters;
import com.mongodb.client.MongoDatabase;

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

// Define the Purchaselist class if it doesn't exist elsewhere

/**
 * Controller for handling Purchaselist-related API routes.
 *
 * Routes include:
 * - GET /api/purchaselist → list all purchaselist items (with optional filters)
 * - GET /api/purchaselist/{id} → get a single purchaselist item
 *
 * Purchaselist is the core data model for tracking what supplies students, and
 * will be used
 * help calculate supplies demands.
 */



//Purchase list info for bottom code

class Item {
    public String item;
    public String brand;
    public String size;
    public String color;
    public int quantity;
    public String notes;



@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Item)) return false;
    Item other = (Item) o;

    return Objects.equals(item, other.item) &&
           Objects.equals(brand, other.brand) &&
           Objects.equals(size, other.size) &&
           Objects.equals(color, other.color);
}

@Override
public int hashCode() {
    return Objects.hash(item, brand, size, color);
}
}

public class PurchaselistController implements Controller {

  private static final String API_PURCHASELIST = "/api/purchaselist";
  // private static final String API_PURCHASELIST_PRINT = "/api/purchaselists/print";

  static final String ITEM_KEY = "item"; //any given item needed
  static final String DESC_KEY = "description";
  static final String NEED_QUANTITY_KEY = "needQuantity"; //quantity of the given item needed, based on checklists
  static final String INVENTORY_QUANTITY_KEY = "inventoryQuantity"; //quantity of the given item in inventory
  static final String PURCHASE_QUANTITY_KEY = "purchaseQuantity"; //quantity of the given item to purchase (need - inventory)

  private final JacksonMongoCollection<Family> familyCollection;
  private final JacksonMongoCollection<Checklist> checklistCollection;
  private final JacksonMongoCollection<Inventory> inventoryCollection;



  // constructor used for testing:database/seed/
  public PurchaselistController(JacksonMongoCollection<Family> familyCollection, JacksonMongoCollection<Checklist> checklistCollection, JacksonMongoCollection<Inventory> inventoryCollection) {
    this.familyCollection = familyCollection;
    this.checklistCollection = checklistCollection;
    this.inventoryCollection = inventoryCollection;
  }

  // constructor used in server:
  public PurchaselistController(MongoDatabase db) {
    familyCollection = JacksonMongoCollection.builder().build(
        db, "families", Family.class, UuidRepresentation.STANDARD);
    checklistCollection = JacksonMongoCollection.builder().build(
      db, "checklist", Checklist.class, UuidRepresentation.STANDARD);
    inventoryCollection = JacksonMongoCollection.builder().build(
      db, "inventory", Inventory.class, UuidRepresentation.STANDARD);
  }

//create a needs list before making purchaselist



//Purchase compare code
public static List<Item> getPurchaselist(String inventoryCollection, String checklistCollection) throws Exception { //The compare(strings) should be relating to inventory and checklist, is there better method?
    ObjectMapper mapper = new ObjectMapper();

    List<Item> inventory = mapper.readValue(
        new File("inventory.json"),
        new TypeReference<List<Item>>() {}
    );

    List<Item> checklist = mapper.readValue(
        new File("checklist"),
        new TypeReference<List<Item>>() {}
    );

    Set<Item> inventorySet = new HashSet<>(inventory);

    List<Item> missingItems = new ArrayList<>();

    for (Item item : checklist) {
        if (!inventorySet.contains(item)) {
            missingItems.add(item);
        }}
      return missingItems;
      }





       /**
   * GET /api/checklist/{id}
   * Retrieves a single supply list item by its MongoDB ObjectId.
   */
  public void getList(Context ctx) {
    String id = ctx.pathParam("id");
    Checklist checklistinv;

    try {
      checklistinv = checklistCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested supply list id wasn't a legal Mongo Object ID.");
    }

    if (checklistinv == null) {
      throw new NotFoundResponse("The requested supply list item was not found");
    } else {
      ctx.json(checklistinv);
      ctx.status(HttpStatus.OK);
    }
  }


  // Normalizes a school name for matching: lowercase, strip trailing " school"
  // static String normalizeSchool(String s) {
  //   if (s == null) {
  //     return "";
  //   }
  //   return s.trim().toLowerCase().replaceAll("\\s+school$", "");
  // }

  // // Normalizes a grade for matching: lowercase, remove hyphens and spaces
  // static String normalizeGrade(String g) {
  //   if (g == null) {
  //     return "";
  //   }
  //   return g.trim().toLowerCase().replaceAll("[\\s\\-]", "");
  // }

  // // Grades considered "high school" for expansion purposes
  // static final String[] HS_GRADES = {"9", "10", "11", "12"};


  // Shallow-copies a Checklist, replacing only the grade field.
  // _id is intentionally omitted — the copies are transient (in-memory only).
  // static Checklist copyWithGrade(Checklist source, String newGrade) {
  //   Checklist copy = new Checklist();
  //   copy.district = source.district;
  //   copy.school = source.school;
  //   copy.grade = newGrade;
  //   copy.teacher = source.teacher;
  //   copy.academicYear = source.academicYear;
  //   copy.item = source.item;
  //   copy.brand = source.brand;
  //   copy.size = source.size;
  //   copy.color = source.color;
  //   copy.type = source.type;
  //   copy.style = source.style;
  //   copy.material = source.material;
  //   copy.count = source.count;
  //   copy.quantity = source.quantity;
  //   copy.notes = source.notes;
  //   return copy;
  // }

  // // --- PRINT ROUTES (on-the-fly, not persisted) ---
  // public void exportPurchaselistPdf(Context ctx) {
  //   // Fetch your purchaselist data
  //   List<Checklist> pdfSupplies = expandHighSchoolSupplies(
  //       checklistCollection.find().into(new ArrayList<>()));
  //   List<Purchaselist> purchaselists = familyCollection.find()
  //       .into(new ArrayList<>())
  //       .stream()
  //       .flatMap(f -> f.students.stream().map(s -> createPurchaselist(s, pdfSupplies)))
  //       .collect(Collectors.toList());

  //   // Build PDF content manually
  //   StringBuilder pdf = new StringBuilder();
  //   pdf.append("%PDF-1.4\n");

  //   // PDF objects
  //   pdf.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
  //   pdf.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");

  //   // Build the text content
  //   StringBuilder text = new StringBuilder();
  //   text.append("BT /F1 12 Tf 50 750 Td\n");

  //   for (Purchaselist c : purchaselists) {
  //       text.append("(")
  //           .append("Student: ").append(c.studentName)
  //           .append(" (")
  //           .append(c.school)
  //           .append(", Grade ")
  //           .append(c.grade)
  //           .append(")")
  //           .append(") Tj T* ");

  //       for (PurchaselistItem item : c.purchaselist) {
  //           text.append("(")
  //               .append(" - ").append(item.supply)
  //               .append(" | completed: ").append(item.completed)
  //               .append(" | unreceived: ").append(item.unreceived)
  //               .append(" | option: ").append(item.selectedOption)
  //               .append(") Tj T* ");
  //       }

  //       text.append("() Tj T* "); // blank line
  //   }

  //   text.append("ET");

  //   // PDF page object
  //   pdf.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]")
  //      .append(" /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n");

  //   // PDF content stream
  //   byte[] textBytes = text.toString().getBytes();
  //   pdf.append("4 0 obj << /Length ").append(textBytes.length).append(" >> stream\n");
  //   pdf.append(text.toString()).append("\nendstream endobj\n");

  //   // Font object
  //   pdf.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");

  //   // Trailer
  //   pdf.append("xref\n0 6\n0000000000 65535 f \n");
  //   pdf.append("trailer << /Size 6 /Root 1 0 R >>\nstartxref\n");
  //   pdf.append(pdf.length()).append("\n%%EOF");

  //   byte[] pdfBytes = pdf.toString().getBytes();

  //   ctx.contentType("application/pdf");
  //   ctx.header("Content-Disposition", "inline; filename=purchaselists.pdf");
  //   ctx.result(pdfBytes);
  // }

  // --- DIGITAL DRIVE-DAY ROUTES (persisted to MongoDB) ---

  // POST /api/purchaselist — snapshot all families into the purchaselists collection
  // public void generatePurchaselist(Context ctx) {
  //   purchaselistCollection.deleteMany(new Document());
  //   List<Checklist> rawSupplies = checklistCollection.find().into(new ArrayList<>());

  //   // Apply the operator-configured drive order from settings
  //   List<Checklist> orderedSupplies = rawSupplies;
  //   if (settingsCollection != null) {
  //     Settings settings = settingsCollection.find(eq("_id", SettingsController.SETTINGS_ID)).first();
  //     if (settings != null && settings.supplyOrder != null && !settings.supplyOrder.isEmpty()) {
  //       orderedSupplies = applySupplyOrder(rawSupplies, settings.supplyOrder);
  //     }
  //   }

  //   final List<Checklist> allSupplies = expandHighSchoolSupplies(orderedSupplies);
  //   List<Purchaselist> purchaselists = familyCollection.find().into(new ArrayList<>()).stream()
  //       .flatMap(f -> f.students.stream().map(s -> createPurchaselist(s, allSupplies)))
  //       .collect(Collectors.toList());
  //   purchaselistCollection.insertMany(purchaselists);
  //   ctx.json(purchaselists);
  //   ctx.status(HttpStatus.CREATED);
  // }


  // GET /api/purchaselist — query stored digital purchaselists (optional ?school= and
  // ?grade= filters)
  // public void getStoredPurchaselists(Context ctx) {
  //   Bson filter = constructFilter(ctx);
  //   ctx.json(purchaselistCollection.find(filter).into(new ArrayList<>()));
  //   ctx.status(HttpStatus.OK);
  // }

  // // Constructs a MongoDB filter from optional query params
  // private Bson constructFilter(Context ctx) {
  //   List<Bson> filters = new ArrayList<>();

  //   if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
  //     Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(SCHOOL_KEY)), Pattern.CASE_INSENSITIVE);
  //     filters.add(regex(SCHOOL_KEY, pattern));
  //   }
  //   if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
  //     Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(GRADE_KEY)), Pattern.CASE_INSENSITIVE);
  //     filters.add(regex(GRADE_KEY, pattern));
  //   }
  //   if (ctx.queryParamMap().containsKey(NAME_KEY)) {
  //     Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(NAME_KEY)), Pattern.CASE_INSENSITIVE);
  //     filters.add(regex(NAME_KEY, pattern));
  //   }

  //   return filters.isEmpty() ? new Document() : and(filters);
  // }

  // // GET /api/purchaselist/{id} — get a single stored purchaselist by id
  // public void getStoredPurchaselistById(Context ctx) {
  //   String id = ctx.pathParam("id");
  //   Purchaselist purchaselist;
  //   try {
  //     purchaselist = purchaselistCollection.find(Filters.eq("_id", new ObjectId(id))).first();
  //   } catch (IllegalArgumentException e) {
  //     throw new BadRequestResponse("Invalid purchaselist ID.");
  //   }
  //   if (purchaselist == null) {
  //     throw new NotFoundResponse("Purchaselist not found.");
  //   }
  //   ctx.json(purchaselist);
  //   ctx.status(HttpStatus.OK);
  // }

  // // PATCH /api/purchaselist/{id}/item/{index} — update a single item (completed,
  // // unreceived, selectedOption)
  // public void updatePurchaselistItem(Context ctx) {
  //   String id = ctx.pathParam("id");
  //   int index;
  //   try {
  //     index = Integer.parseInt(ctx.pathParam("index"));
  //   } catch (NumberFormatException e) {
  //     throw new BadRequestResponse("Item index must be an integer.");
  //   }
  //   Purchaselist purchaselist;
  //   try {
  //     purchaselist = purchaselistCollection.find(Filters.eq("_id", new ObjectId(id))).first();
  //   } catch (IllegalArgumentException e) {
  //     throw new BadRequestResponse("Invalid purchaselist ID.");
  //   }
  //   if (purchaselist == null) {
  //     throw new NotFoundResponse("Purchaselist not found.");
  //   }
  //   if (index < 0 || index >= purchaselist.purchaselist.size()) {
  //     throw new BadRequestResponse("Item index out of range.");
  //   }
  //   // Parse only the fields present in the request body
  //   var body = ctx.bodyAsClass(ItemUpdateRequest.class);
  //   Purchaselist.PurchaselistItem item = purchaselist.purchaselist.get(index);
  //   if (body.completed != null)
  //     item.completed = body.completed;
  //   if (body.unreceived != null)
  //     item.unreceived = body.unreceived;
  //   if (body.selectedOption != null)
  //     item.selectedOption = body.selectedOption;
  //   purchaselistCollection.save(purchaselist);
  //   ctx.json(purchaselist);
  //   ctx.status(HttpStatus.OK);
  // }
  // // Request body for PATCH item update
  // public static class ItemUpdateRequest {
  //   public Boolean completed;
  //   public Boolean unreceived;
  //   public String selectedOption;
  // }

  @Override
  public void addRoutes(Javalin server) {
    // Print routes (on-the-fly, no persistence)
    // server.get(API_PURCHASELIST_PRINT, this::printAllPurchaselists);
    // server.get(API_PURCHASELIST_BY_NAME, this::printPurchaselistByStudent);
    // server.get(API_PURCHASELIST_FAMILY, this::printPurchaselistsByFamily);

    // Digital drive-day routes (persisted)
    server.get(API_PURCHASELIST, this::getPurchaselist);
    server.get(API_PURCHASELIST, this::getNeededItem);
    // server.get(API_PURCHASELIST, this::getStoredPurchaselists);
    // server.get("/purchaselists/export/pdf", this::exportPurchaselistsPdf);

    // server.get(API_PURCHASELIST_BY_ID, this::getStoredPurchaselistById);
    // server.patch(API_PURCHASELIST_ITEM, this::updatePurchaselistItem);
  }
      }
