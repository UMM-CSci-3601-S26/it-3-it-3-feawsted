// Packages
package umm3601.family;

// Static Imports
import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Java Imports
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

// Org Imports
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

// Com Imports
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;

/**
 * Tests for the FamilyController using a real MongoDB "test" database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 *  - Getting all families or a single family by ID
 *  - Handling bad or nonexistent IDs
 *  - Adding new families and checking that validation works
 *  - Deleting families and making sure the database updates correctly
 *  - Dashboard stats and CSV export formatting
 *  - Making sure the controller actually registers its routes
 *
 * Each test starts with a clean set of family documents so results are
 * predictable and easy to understand.
 */

// Tests for the Family Controller
@SuppressWarnings({ "MagicNumber" })
class FamilyControllerSpec {

  private FamilyController familyController;

  private ObjectId testFamilyId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Family>> familyArrayListCaptor;

  @Captor
  private ArgumentCaptor<Family> familyCaptor;

  @SuppressWarnings("unused")
  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @Captor
  private ArgumentCaptor<Map<String, Object>> dashboardCaptor;

  // Runs once before all the tests. This connects to a real MongoDB "test"
  // database so the controller is working with actual data instead of fake mocks.
  // Basically sets up the shared database the tests will use.
  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  // Runs before every test. We clear out the families collection, insert a small
  // set of sample families, and reset all the mocks. This keeps each test
  // independent so nothing gets messed up by a previous test.
  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    MongoCollection<Document> familyDocuments = db.getCollection("families");
    familyDocuments.drop();

    List<Document> testFamilies = new ArrayList<>();

    testFamilies.add(
      new Document()
        .append("guardianName", "Jane Doe")
        .append("altPickUp", "")
        .append("email", "jane@email.com")
        .append("address", "123 Street")
        .append("timeSlot", "10:00-11:00")
        .append("students", List.of(
          new Document()
            .append("name", "Alice")
            .append("grade", "3")
            .append("school", "MAHS")
            .append("requestedSupplies", List.of("headphones")),
          new Document()
            .append("name", "Timmy")
            .append("grade", "5")
            .append("school", "MAHS")
            .append("requestedSupplies", List.of("headphones"))
        ))
    );
    testFamilies.add(
      new Document()
      .append("guardianName", "John Christensen")
      .append("altPickUp", "Joe Hills")
      .append("email", "jchristensen@email.com")
      .append("address", "713 Broadway")
      .append("timeSlot", "8:00-9:00")
      .append("students", List.of(
        new Document()
          .append("name", "Sara")
          .append("grade", "7")
          .append("school", "MAHS")
          .append("requestedSupplies", List.of("backpack", "headphones")),
        new Document()
          .append("name", "Ronan")
          .append("grade", "4")
          .append("school", "HHS")
          .append("requestedSupplies", List.of())
      ))
    );
    testFamilies.add(
      new Document()
        .append("guardianName", "John Johnson")
        .append("altPickUp", "Jane Johnson")
        .append("email", "jjohnson@email.com")
        .append("address", "456 Avenue")
        .append("timeSlot", "2:00-3:00")
        .append("students", List.of(
          new Document()
            .append("name", "Lilian")
            .append("grade", "1")
            .append("school", "HHS")
            .append("requestedSupplies", List.of("backpack"))
        ))
    );

    testFamilyId = new ObjectId();

    Document specialFamily = new Document()
      .append("_id", testFamilyId)
      .append("guardianName", "Bob Jones")
      .append("altPickUp", "")
      .append("email", "bob@email.com")
      .append("address", "456 Oak Ave")
      .append("timeSlot", "2:00-3:00")
      .append("students", List.of(
        new Document()
          .append("name", "Sara")
          .append("grade", "5")
          .append("school", "Roosevelt")
          .append("requestedSupplies", List.of())
      ));

    familyDocuments.insertMany(testFamilies);
    familyDocuments.insertOne(specialFamily);

    familyController = new FamilyController(db);
  }

  // Checks that the controller actually registers all its routes with Javalin.
  // If someone removes or renames a route by accident, this test will catch it.
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);

    familyController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(4)).get(any(), any());
    verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
    verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
  }

  // Makes sure that asking for all families returns everything in the database.
  // Also checks that the controller responds with a 200 OK.
  @Test
  void canGetAllFamilies() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
    familyController.getFamilies(ctx);

    verify(ctx).json(familyArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(
      db.getCollection("families").countDocuments(),
      familyArrayListCaptor.getValue().size());
  }

  // Looks up a family using a real ID and makes sure the controller returns the
  // correct family and a 200 OK status.
  @Test
  void getFamilyWithExistentId() {
    String id = testFamilyId.toString();
    when(ctx.pathParam("id")).thenReturn(id);

    familyController.getFamily(ctx);

    verify(ctx).json(familyCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Bob Jones", familyCaptor.getValue().guardianName);
    assertEquals(testFamilyId.toString(), familyCaptor.getValue()._id);
  }

  // If the ID in the URL isn’t even shaped like a real MongoDB ObjectId,
  // the controller should reject it right away. This test checks that
  @Test
  void getFamilyWithBadId() {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      familyController.getFamily(ctx);
    });

    assertEquals(
      "The requested family id wasn't a legal Mongo Object ID.",
      exception.getMessage());
  }

  // The ID format is valid, but nothing in the database matches it.
  // The controller should return a “not found” error instead of pretending it’s fine.
  @Test
  void getFamiliesWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      familyController.getFamily(ctx);
    });

    assertEquals("The requested family was not found", exception.getMessage());
  }

  // Adds a brand‑new family using valid JSON. After the controller inserts it,
  // we check the database to make sure the fields were saved correctly.
  // Also checks that the controller returns 201 CREATED
  @Test
  void addNewFamily() {
    Family newFamily = new Family();
    newFamily.guardianName = "Charlie Brown";
    newFamily.altPickUp = "Caisy Brown";
    newFamily.email = "charlie@email.com";
    newFamily.address = "789 Pine St";
    newFamily.timeSlot = "Evening";
    newFamily.students = new ArrayList<>();

    String json = javalinJackson.toJsonString(newFamily, Family.class);

    when(ctx.body()).thenReturn(json);
    when(ctx.bodyValidator(Family.class))
      .thenReturn(new BodyValidator<>(
        json,
        Family.class,
        () -> javalinJackson.fromJsonString(json, Family.class)
      ));

    familyController.addNewFamily(ctx);

    verify(ctx).json(mapCaptor.capture());
    verify(ctx).status(HttpStatus.CREATED);

    Document added = db.getCollection("families")
      .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id"))))
      .first();

    assertEquals("Charlie Brown", added.get("guardianName"));
    assertEquals("Caisy Brown", added.get("altPickUp"));
    assertEquals("charlie@email.com", added.get("email"));
  }

  // Tries to add a family with an invalid email address. The controller should
  // reject it with a validation error instead of saving bad data
  @Test
  void addInvalidEmail() {
    String json = """
      {
        "guardianName": "Bad Email",
        "altPickUp": "No Pick Up",
        "email": "not-an-email",
        "address": "123 Street",
        "timeSlot": "Morning",
        "students": []
      }
      """;

    when(ctx.body()).thenReturn(json);
    when(ctx.bodyValidator(Family.class))
      .thenReturn(new BodyValidator<>(
        json,
        Family.class,
        () -> javalinJackson.fromJsonString(json, Family.class)
      ));

    ValidationException exception =
      assertThrows(ValidationException.class, () -> {
        familyController.addNewFamily(ctx);
      });

    assertTrue(
      exception.getErrors()
        .get("REQUEST_BODY")
        .get(0)
        .toString()
        .contains("valid email"));
  }

  // Deletes a family that actually exists. After calling delete, the family
  // should be gone from the database and the controller should return 200 OK
  @Test
  void deleteFoundFamily() {
    when(ctx.pathParam("id"))
      .thenReturn(testFamilyId.toString());

    familyController.deleteFamily(ctx);

    verify(ctx).status(HttpStatus.OK);

    assertEquals(0,
      db.getCollection("families")
        .countDocuments(eq("_id", testFamilyId)));
  }

  // Tries to delete a family that isn’t in the database. The controller should
  // return a “not found” error and not pretend the delete worked
  @Test
  void deleteFamilyNotFound() {

    // Valid ObjectId format, but not in database
    String nonExistentId = new ObjectId().toString();
    when(ctx.pathParam("id")).thenReturn(nonExistentId);

    NotFoundResponse exception =
      assertThrows(NotFoundResponse.class, () -> {
        familyController.deleteFamily(ctx);
      });

    verify(ctx).status(HttpStatus.NOT_FOUND);

    assertTrue(exception.getMessage().contains(nonExistentId));
    assertTrue(exception.getMessage().contains("Was unable to delete Family ID"));
  }

  // Makes sure the dashboard stats include all the expected fields and that the
  // total family count matches what’s in the database
  @Test
  void getDashboardStats() {
    familyController.getDashboardStats(ctx);
    verify(ctx).json(dashboardCaptor.capture());
    Map<String, Object> result = dashboardCaptor.getValue();

    assertTrue(result.containsKey("studentsPerSchool"));
    assertTrue(result.containsKey("studentsPerGrade"));
    assertTrue(result.containsKey("totalFamilies"));

    assertEquals(
      (int) db.getCollection("families").countDocuments(),
      result.get("totalFamilies")
    );
  }

  // Checks that the CSV export endpoint produces a properly formatted CSV string,
  // including the header and the correct student counts for each family
  @Test
  void exportFamiliesAsCSVProducesCorrectCSV() {
    familyController.exportFamiliesAsCSV(ctx);
    ArgumentCaptor<String> resultCaptor = ArgumentCaptor.forClass(String.class);

    verify(ctx).result(resultCaptor.capture());
    verify(ctx).contentType("text/csv");
    verify(ctx).status(HttpStatus.OK);

    String csv = resultCaptor.getValue();

    // Check header
    assertTrue(csv.contains(
      "Guardian Name,Alternate Pick Up,Email,Address,Time Slot,Number of Students"));

    // Check Jane Doe (2 students)
    assertTrue(csv.contains(
      "\"Jane Doe\",\"\",\"jane@email.com\",\"123 Street\",\"10:00-11:00\",2"));

    // Check John Christensen (2 students)
    assertTrue(csv.contains(
      "\"John Christensen\",\"Joe Hills\",\"jchristensen@email.com\",\"713 Broadway\",\"8:00-9:00\",2"));

    // Check John Johnson (1 student)
    assertTrue(csv.contains(
      "\"John Johnson\",\"Jane Johnson\",\"jjohnson@email.com\",\"456 Avenue\",\"2:00-3:00\",1"));

    // Check Bob Jones (1 student)
    assertTrue(csv.contains(
      "\"Bob Jones\",\"\",\"bob@email.com\",\"456 Oak Ave\",\"2:00-3:00\",1"));
  }
}
