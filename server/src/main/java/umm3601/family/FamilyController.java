// Packages
package umm3601.family;

// Static Imports
import static com.mongodb.client.model.Filters.eq;

// Java Imports
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Org Imports
import org.bson.UuidRepresentation;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

// Com Imports
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

// Misc Imports
import umm3601.Controller;

/**
 * Controller for handling Family-related API routes.
 *
 * Routes include:
 *  - GET /api/family              → list all families
 *  - GET /api/family/{id}         → get a single family
 *  - POST /api/family             → add a new family
 *  - DELETE /api/family/{id}      → delete a family
 *  - GET /api/dashboard           → aggregated student statistics
 *  - GET /api/family/export       → export families as CSV
 *
 * Families are the core registration unit, and dashboard stats
 * rely on embedded student data.
 */

public class FamilyController implements Controller {

  private static final String API_FAMILY = "/api/families";
  private static final String API_DASHBOARD = "/api/dashboard";
  private static final String API_FAMILY_BY_ID = "/api/families/{id}";
  private static final String API_FAMILY_EXPORT = "/api/families/export";

  // Basic email validation regex
  public static final String EMAIL_REGEX = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";

  private final JacksonMongoCollection<Family> familyCollection;

  public FamilyController(MongoDatabase database) {
    // Connects to the "families" collection using Jackson for serialization
    familyCollection = JacksonMongoCollection.builder().build(
        database,
        "families",
        Family.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * GET /api/families/{id}
   * Retrieves a single family by MongoDB ObjectId.
   *
   * Includes error handling for:
   *  - invalid ObjectId format
   *  - non-existent family
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

  /**
   * GET /api/families
   * Returns all registered families.
   */
  public void getFamilies(Context ctx) {
    ArrayList<Family> matchingFamilies = familyCollection
      .find()
      .into(new ArrayList<>());

    ctx.json(matchingFamilies);
    ctx.status(HttpStatus.OK);
  }

  /**
   * POST /api/families
   * Adds a new family registration.
   *
   * Validation ensures:
   *  - valid email format
   *
   * Future improvements (Iteration 2):
   *  - Validate that students list is not empty
   *  - Validate that grade/school fields are present
   *  - Validate requestedSupplies against Supply collection
   */
  public void addNewFamily(Context ctx) {
    String body = ctx.body();

    Family newFamily = ctx.bodyValidator(Family.class)
      .check(fam -> fam.email.matches(EMAIL_REGEX),
        "Family must have a valid email; body was " + body)
      // Additional validation can be added here
      .get();

    familyCollection.insertOne(newFamily);

    ctx.json(Map.of("id", newFamily._id));
    ctx.status(HttpStatus.CREATED);
  }

  /**
   * DELETE /api/families/{id}
   * Removes a family registration.
   *
   * Returns 200 OK if deletion was successful, or 404 Not Found if:
   *  - the ID is invalid
   *  - no family with that ID exists
   */
  public void deleteFamily(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = familyCollection.deleteOne(eq("_id", new ObjectId(id)));

    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete Family ID"
          + id
          + "; perhaps illegal Family ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * GET /api/dashboard
   * Computes summary statistics for:
   *  - students per school
   *  - students per grade
   *  - total families
   *
   * Because students are embedded inside families,
   * this requires only one database query.
   *
   * Future improvements (Iteration 2):
   *  - total students
   *  - filterable for per district, grade, and school.
   */
  public void getDashboardStats(Context ctx) {
    ArrayList<Family> families = familyCollection
      .find()
      .into(new ArrayList<>());

    Map<String, Integer> studentsPerSchool = new HashMap<>();
    Map<String, Integer> studentsPerGrade = new HashMap<>();

    for (Family family : families) {
      for (Family.StudentInfo student : family.students) {
        // Count per school
        studentsPerSchool.merge(student.school, 1, Integer::sum);

        // Count per grade
        studentsPerGrade.merge(student.grade, 1, Integer::sum);
      }
    }
    Map<String, Object> result = new HashMap<>();
    result.put("studentsPerSchool", studentsPerSchool);
    result.put("studentsPerGrade", studentsPerGrade);
    result.put("totalFamilies", families.size());

    ctx.json(result);
  }

  /**
   * GET /api/family/export
   * Exports a simple CSV of family-level data.
   *
   * Note: This does NOT export student-level details.
   * Future teams may expand this to include:
   *  - requested supplies
   *  - filtering options
   */
  public void exportFamiliesAsCSV(Context ctx) {
    List<Family> families = familyCollection.find().into(new ArrayList<>());

    StringBuilder csv = new StringBuilder();

    // CSV header row
    csv.append("Guardian Name,Email,Address,Time Slot,Number of Students\n");

    for (Family family : families) {
      int studentCount = family.students != null ? family.students.size() : 0;

      csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",%d\n",
        family.guardianName,
        family.email,
        family.address,
        family.timeSlot,
        studentCount
      ));
    }

    ctx.contentType("text/csv");
    ctx.header("Content-Disposition", "attachment; filename=families.csv");
    ctx.status(HttpStatus.OK);
    ctx.result(csv.toString());
  }

  /**
   * Registers all API routes for this controller.
   *
   * Note: Specific routes (like /export and /dashboard)
   * are placed BEFORE the {id} routes to avoid conflicts
   * which our team experienced.
   */
  @Override
  public void addRoutes(Javalin server) {
    server.get(API_FAMILY, this::getFamilies);
    server.post(API_FAMILY, this::addNewFamily);

    // Specific routes FIRST
    server.get(API_FAMILY_EXPORT, this::exportFamiliesAsCSV);
    server.get(API_DASHBOARD, this::getDashboardStats);

    // ID-based routes LAST
    server.get(API_FAMILY_BY_ID, this::getFamily);
    server.delete(API_FAMILY_BY_ID, this::deleteFamily);
  }
}
