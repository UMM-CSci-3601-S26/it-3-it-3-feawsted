// Packages
package umm3601.checklist;

// Static Imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// Java Imports
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
import com.mongodb.client.model.Sorts;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
// Misc Imports
import umm3601.Controller;
import umm3601.family.Family;
import umm3601.supplylist.SupplyList;

/**
 * Controller for handling Checklist-related API routes.
 *
 * Routes include:
 *  - GET /api/checklist             → list all checklist items (with optional filters)
 *  - GET /api/checklist/{id}         → get a single checklist item
 *
 * Checklist is the core data model for tracking what supplies students, and will be used
 * help calculate supplies demands.
 */

public class ChecklistController implements Controller {
  private static final String API_CHECKLIST = "/api/checklist";
  private static final String API_CHECKLIST_BY_ID = "/api/checklist/{id}";

  static final String SCHOOL_KEY = "students.school";
  static final String GRADE_KEY = "students.grade";
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


  private final JacksonMongoCollection<Family> familyCollection;
  private final JacksonMongoCollection<SupplyList> supplyListCollection;

  public ChecklistController(MongoDatabase database) {
    // Connects to the "checklist" collection using Jackson for serialization
    this.familyCollection = JacksonMongoCollection.builder().build(
      database,
      "families",
      Family.class,
      UuidRepresentation.STANDARD
    );
     this.supplyListCollection = JacksonMongoCollection.builder().build(
      database,
      "supplylist",
      SupplyList.class,
      UuidRepresentation.STANDARD
    );
  }

  /**
   * GET /api/checklist/{id}
   * Retrieves a single supply list item by its MongoDB ObjectId.
   */
  public void getFamily(Context ctx) {
    String id = ctx.pathParam("id");
    Family family;

    try {
      family = familyCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested family id wasn't a legal Mongo Object ID.");
    }
    if (family == null) {
      throw new NotFoundResponse("The requested family was not found");
    } else {
      ctx.json(family);
      ctx.status(HttpStatus.OK);
    }
  }

  public void getFamilies(Context ctx) {
    ArrayList<Family> matchingFamilies = familyCollection
      .find()
      .into(new ArrayList<>());

    ctx.json(matchingFamilies);
    ctx.status(HttpStatus.OK);
  }

  public void getList(Context ctx) {
    String id = ctx.pathParam("id");
    Family familyinv;

    try {
      familyinv = familyCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested checklist id wasn't a legal Mongo Object ID.");
    }

    if (familyinv == null) {
      throw new NotFoundResponse("The requested checklist item was not found");
    } else {
      ctx.json(familyinv);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * GET /api/checklist
   * Retrieves all checklist items, with optional query parameters for filtering.
   */
  public void getChecklists(Context ctx) {
    Bson filter = constructFamilyFilter(ctx);

    FindIterable<Family> results = familyCollection.find(filter);

    ArrayList<Family> matching = results.into(new ArrayList<>());

    ctx.json(matching);
    ctx.status(HttpStatus.OK);
  }

  // (Family - Students) Constructs a MongoDB filter based on query parameters in the request context.
  private Bson constructFamilyFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    // For school
    if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(SCHOOL_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(SCHOOL_KEY, pattern));
    }

    // For grade
    if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(GRADE_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(GRADE_KEY, pattern));
    }
  return filters.isEmpty() ? new Document() : and(filters);
  }

  // (Supply List) Constructs a MongoDB filter based on query parameters in the request context.
  private Bson constructSupplyFilter(Context ctx) {
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

    // // For type
    // if (ctx.queryParamMapsupplylist().containsKey(TYPE_KEY)) {
    //   Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(TYPE_KEY)), Pattern.CASE_INSENSITIVE);
    //   filters.add(regex(TYPE_KEY, pattern));
    // }

    // If no filters, return an empty Document to match all; otherwise combine with $and
    return filters.isEmpty() ? new Document() : and(filters);
  }

  /**
   * Registers API routes for this controller.
   */
  @Override
  public void addRoutes(Javalin server) {
    server.get(API_CHECKLIST, this::getChecklists);
    server.get(API_CHECKLIST_BY_ID, this::getList);
  }







 /*public void getChecklists(Context ctx) {
    // We'll support sorting the results either by company name (in either `asc` or `desc` order)
    // or by the number of users in the company (`count`, also in either `asc` or `desc` order).
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortBy"), "_id");
    if (sortBy.equals("family")) {
      sortBy = "_id";
    }
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortOrder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);

    // The `UserByCompany` class is a simple class that has fields for the company
    // name, the number of users in that company, and a list of user names and IDs
    // (using the `UserIdName` class to store the user names and IDs).
    // We're going to use the aggregation pipeline to group users by company, and
    // then count the number of users in each company. We'll also collect the user
    // names and IDs for each user in each company. We'll then convert the results
    // of the aggregation pipeline to `UserByCompany` objects.

    ArrayList<ChecklistByFamily> matchingUsers = userCollection
      // The following aggregation pipeline groups users by company, and
      // then counts the number of users in each company. It also collects
      // the user names and IDs for each user in each company.
      .aggregate(
        List.of(
          // Project the fields we want to use in the next step, i.e., the _id, name, and company fields
          new Document("$project", new Document("_id", 1).append("name", 1).append("company", 1)),
          // Group the users by company, and count the number of users in each company
          new Document("$group", new Document("_id", "$company")
            // Count the number of users in each company
            .append("count", new Document("$sum", 1))
            // Collect the user names and IDs for each user in each company
            .append("users", new Document("$push", new Document("_id", "$_id").append("name", "$name")))),
          // Sort the results. Use the `sortby` query param (default "company")
          // as the field to sort by, and the query param `sortorder` (default
          // "asc") to specify the sort order.
          new Document("$sort", sortingOrder)
        ),
        // Convert the results of the aggregation pipeline to UserGroupResult objects
        // (i.e., a list of UserGroupResult objects). It is necessary to have a Java type
        // to convert the results to, and the JacksonMongoCollection will do this for us.
        ChecklistByFamily.class
      )
      .into(new ArrayList<>());

    ctx.json(matchingUsers);
    ctx.status(HttpStatus.OK);
  }  */





}

