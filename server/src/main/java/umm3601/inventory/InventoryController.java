// Packages
package umm3601.inventory;

// Static Imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// Java Imports
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

// Org Imports
import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

// Com Imports
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.result.DeleteResult;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

// Misc Imports
import umm3601.Controller;

/**
 * Controller for handling Inventory-related API routes.
 *
 * Routes include:
 *  - GET /api/inventory              → list all inventory items (with optional filters)
 *  - GET /api/inventory/{id}         → get a single inventory item
 *  - POST /api/inventory             → add a new inventory item
 *  - DELETE /api/inventory/{id}      → delete an inventory item
 *
 * Inventory is the core data model for tracking available school supplies, and is used for both
 * display and fulfillment.
 */
public class InventoryController implements Controller {

  private static final String API_INVENTORY = "/api/inventory";
  private static final String API_INVENTORY_BY_ID = "/api/inventory/{id}";

  static final String ITEM_KEY = "item";
  static final String BRAND_KEY = "brand";
  static final String COUNT_KEY = "count";
  static final String SIZE_KEY = "size";
  static final String COLOR_KEY = "color";
  static final String DESCRIPTION_KEY = "description";
  static final String QUANTITY_KEY = "quantity";
  static final String NOTES_KEY = "notes";
  static final String MATERIAL_KEY = "material";
  static final String TYPE_KEY = "type";
  static final String SORT_ORDER_KEY = "sortorder";

  private final JacksonMongoCollection<Inventory> inventoryCollection;

  public InventoryController(MongoDatabase database) {
    // Connects to the "inventory" collection using Jackson for serialization
    inventoryCollection = JacksonMongoCollection.builder().build(
      database,
      "inventory",
      Inventory.class,
      UuidRepresentation.STANDARD
    );
  }

  /**
   * GET /api/inventory/{id}
   * Retrieves a single inventory item by its MongoDB ObjectId.
   */
  public void getInventoryItem(Context ctx) {
    String id = ctx.pathParam("id");
    Inventory inv;

    try {
      inv = inventoryCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested inventory id wasn't a legal Mongo Object ID.");
    }

    if (inv == null) {
      throw new NotFoundResponse("The requested inventory item was not found");
    } else {
      ctx.json(inv);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * GET /api/inventory
   * Retrieves all inventory items, with optional query parameters for filtering.
   */
  public void getInventories(Context ctx) {
    Bson filter = constructFilter(ctx);
    FindIterable<Inventory> results = inventoryCollection.find(filter);
    ArrayList<Inventory> matching = results.into(new ArrayList<>());

    ctx.json(matching);
    ctx.status(HttpStatus.OK);
  }

  // Constructs a MongoDB filter based on query parameters in the request context.
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    // For item
    if (ctx.queryParamMap().containsKey(ITEM_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(ITEM_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(ITEM_KEY, pattern));
    }

    // For brand
    if (ctx.queryParamMap().containsKey(BRAND_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(BRAND_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(BRAND_KEY, pattern));
    }

    // For color
    if (ctx.queryParamMap().containsKey(COLOR_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(COLOR_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(COLOR_KEY, pattern));
    }

    // For size
    if (ctx.queryParamMap().containsKey(SIZE_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(SIZE_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(SIZE_KEY, pattern));
    }

    // For description
    if (ctx.queryParamMap().containsKey(DESCRIPTION_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(DESCRIPTION_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(DESCRIPTION_KEY, pattern));
    }

    // For quantity, which must be an integer
    if (ctx.queryParamMap().containsKey(QUANTITY_KEY)) {
      String qParam = ctx.queryParam(QUANTITY_KEY);
      try {
        int q = Integer.parseInt(qParam);
        filters.add(Filters.eq(QUANTITY_KEY, q));
      } catch (NumberFormatException e) {
        throw new BadRequestResponse("quantity must be an integer.");
      }
    }

    // For notes
    if (ctx.queryParamMap().containsKey(NOTES_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(NOTES_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(NOTES_KEY, pattern));
    }

    // For material
    if (ctx.queryParamMap().containsKey(MATERIAL_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(MATERIAL_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(MATERIAL_KEY, pattern));
    }

    // For type
    if (ctx.queryParamMap().containsKey(TYPE_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(TYPE_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(TYPE_KEY, pattern));
    }

    // If no filters, return an empty Document to match all; otherwise combine with $and
    return filters.isEmpty() ? new Document() : and(filters);
  }

  /**
   * POST /api/inventory
   * Adds a new inventory item.
   *
   * Validation ensures:
   *  - quantity is non-negative
   *  - count is at least 1
   *  - item name is present
   */
  public void addInventory(Context ctx) {
    //String body = ctx.body();
    Inventory newItem = ctx.bodyValidator(Inventory.class)
      .check(inventory -> inventory.quantity >= 0,
        "Quantity must be >= 0")
      .check(inventory -> inventory.count >= 1,
        "Quantity must be 1 or more")
      .check(inventory -> inventory.item != null && inventory.item.length() > 0,
        "Inventory must have a non-empty item key")
      // Additional validation can be added here
      .get();

    inventoryCollection.insertOne(newItem);

    ctx.json(Map.of("id", newItem._id));
    ctx.status(HttpStatus.CREATED);
  }


  /**
   * DELETE /api/inventory/{id}
   * Deletes an inventory item by its MongoDB ObjectId.
   *
   * Returns 200 OK if deletion was successful, or 404 Not Found if:
   *  - the ID is invalid
   *  - no inventory item with that ID exists
  */
  public void deleteInventory(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = inventoryCollection.deleteOne(eq("_id", new ObjectId(id)));

    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * Registers API routes for this controller.
   */
  @Override
  public void addRoutes(Javalin server) {
    server.get(API_INVENTORY, this::getInventories);
    server.get(API_INVENTORY_BY_ID, this::getInventoryItem);
    server.post(API_INVENTORY, this::addInventory);
    server.delete(API_INVENTORY_BY_ID, this::deleteInventory);
  }
}
