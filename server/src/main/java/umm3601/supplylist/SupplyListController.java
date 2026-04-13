// Packages
package umm3601.supplylist;

// Static Imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// Java Imports
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
//import io.javalin.http.SwitchingProtocolsResponse;
// Misc Imports
import umm3601.Controller;

/**
 * Controller for handling SupplList-related API routes.
 *
 * Routes include:
 *  - GET /api/inventory              → list all supply list items (with optional filters)
 *  - GET /api/inventory/{id}         → get a single supply list item
 *
 * Supply List is the core data model for tracking what supplies students, and will be used
 * help calculate supply demands.
 */

public class SupplyListController implements Controller {
  @SuppressWarnings("SpellCheckingInspection")
  private static final String API_SUPPLYLIST = "/api/supplylist";
  private static final String API_SUPPLYLIST_BY_ID = "/api/supplylist/{id}";

  static final String SCHOOL_KEY = "school";
  static final String GRADE_KEY = "grade";
  static final String TEACHER_KEY = "teacher";
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

  private final JacksonMongoCollection<SupplyList> supplyListCollection;

  @SuppressWarnings("SpellCheckingInspection")
  public SupplyListController(MongoDatabase database) {
    // Connects to the "supplylist" collection using Jackson for serialization
    supplyListCollection = JacksonMongoCollection.builder().build(
      database,
      "supplylist",
      SupplyList.class,
      UuidRepresentation.STANDARD
    );
  }

  /**
   * GET /api/supplylist/{id}
   * Retrieves a single supply list item by its MongoDB ObjectId.
   */
  public void getList(Context ctx) {
    String id = ctx.pathParam("id");
    SupplyList supplylistinv;

    try {
      supplylistinv = supplyListCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested supply list id wasn't a legal Mongo Object ID.");
    }

    if (supplylistinv == null) {
      throw new NotFoundResponse("The requested supply list item was not found");
    } else {
      ctx.json(supplylistinv);
      ctx.status(HttpStatus.OK);
    }
  }

  // "Crayons,,pencils"
  private Bson multipleIntakeFilter(String field, String raw) {
    List<Pattern> patterns = Arrays.stream(raw.split(","))
      .map(String::trim)
      .filter(s -> !s.isEmpty())
      .map(s -> Pattern.compile(Pattern.quote(s), Pattern.CASE_INSENSITIVE))
      .toList();

    return Filters.in(field, patterns);
  }

  /**
   * GET /api/supplylist
   * Retrieves all supply list items, with optional query parameters for filtering.
   */
  public void getSupplyLists(Context ctx) {
    Bson filter = constructFilter(ctx);

    FindIterable<SupplyList> results = supplyListCollection.find(filter);

    ArrayList<SupplyList> matching = results.into(new ArrayList<>());

    ctx.json(matching);
    ctx.status(HttpStatus.OK);
  }

  // Constructs a MongoDB filter based on query parameters in the request context.
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    // For school
    if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
      filters.add(multipleIntakeFilter(SCHOOL_KEY, ctx.queryParam(SCHOOL_KEY)));
    }

    // For grade
    if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
      filters.add(multipleIntakeFilter(GRADE_KEY, ctx.queryParam(GRADE_KEY)));
    }

    // For item
    if (ctx.queryParamMap().containsKey(ITEM_KEY)) {
      filters.add(multipleIntakeFilter(ITEM_KEY, ctx.queryParam(ITEM_KEY)));
    }

    // For brand
    if (ctx.queryParamMap().containsKey(BRAND_KEY)) {
      filters.add(multipleIntakeFilter(BRAND_KEY, ctx.queryParam(BRAND_KEY)));
    }

    // For color
    if (ctx.queryParamMap().containsKey(COLOR_KEY)) {
      filters.add(multipleIntakeFilter(COLOR_KEY, ctx.queryParam(COLOR_KEY)));
    }

    // For size
    if (ctx.queryParamMap().containsKey(SIZE_KEY)) {
      filters.add(multipleIntakeFilter(SIZE_KEY, ctx.queryParam(SIZE_KEY)));
    }

    // For description
    if (ctx.queryParamMap().containsKey(DESCRIPTION_KEY)) {
      filters.add(multipleIntakeFilter(DESCRIPTION_KEY, ctx.queryParam(DESCRIPTION_KEY)));
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
      filters.add(multipleIntakeFilter(MATERIAL_KEY, ctx.queryParam(MATERIAL_KEY)));
    }

    // For type
    if (ctx.queryParamMap().containsKey(TYPE_KEY)) {
      filters.add(multipleIntakeFilter(TYPE_KEY, ctx.queryParam(TYPE_KEY)));
    }

    // If no filters, return an empty Document to match all; otherwise combine with $and
    return filters.isEmpty() ? new Document() : and(filters);
  }

  /**
   * Registers API routes for this controller.
   */
  @Override
  public void addRoutes(Javalin server) {
    server.get(API_SUPPLYLIST, this::getSupplyLists);
    server.get(API_SUPPLYLIST_BY_ID, this::getList);
  }
}
