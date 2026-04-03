// Packages
package umm3601.checklist;

import static com.mongodb.client.model.Filters.eq;
// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
import org.mongojack.Id;
import org.mongojack.JacksonMongoCollection;

// Com Imports
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.FindIterable;
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
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.supplylist.SupplyList;
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.supplylist.SupplyList;

/**
 * Tests for the ChecklistController using a real MongoDB "test" database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 *  - Getting all families or a single checklist by ID
 *  - Handling bad or nonexistent IDs
 *  - Adding new families and checking that validation works
 *  - Deleting families and making sure the database updates correctly
 *  - Dashboard stats and CSV export formatting
 *  - Making sure the controller actually registers its routes
 *
 * Each test starts with a clean set of checklist documents so results are
 * predictable and easy to understand.
 */

// Tests for the Checklist Controller
@SuppressWarnings({ "MagicNumber" })
class ChecklistControllerSpec {

  private ChecklistController checklistController;

  private ObjectId testChecklistId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Checklist>> checklistArrayListCaptor;

  @Captor
  private ArgumentCaptor<Checklist> checklistCaptor;

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

    MongoCollection<Document> checklistDocuments = db.getCollection("families");
    checklistDocuments.drop();

    List<Document> testChecklists = new ArrayList<>();

    testChecklists.add(
      new Document()
        .append("school", "MAHS")
        .append("grade", "4")
        .append("studentName", "Elmo")
        .append("requestedSupplies", List.of("headphones"))
    );
    testChecklists.add(
      new Document()
        .append("school", "AHS")
        .append("grade", "8")
        .append("studentName", "johnny")
        .append("requestedSupplies", List.of("backpack"))
    );
testChecklists.add(
      new Document()
        .append("school", "SSHS")
        .append("grade", "2")
        .append("studentName", "Rocco")
        .append("requestedSupplies", List.of(""))
    );

    testChecklistId = new ObjectId();

    Document specialChecklist = new Document()
      .append("_id", testChecklistId)
      .append("school", "Nowhere")
      .append("grade", "12")
      .append("studentName", "bart")
      .append("requestedSupplies", List.of("nothing"));

    checklistDocuments.insertMany(testChecklists);
    checklistDocuments.insertOne(specialChecklist);

    checklistController = new ChecklistController(db);
  }

  // Checks that the controller actually registers all its routes with Javalin.
  // If someone removes or renames a route by accident, this test will catch it.  @Test
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);

    checklistController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(1)).get(any(), any());

    verify(mockServer, atLeastOnce()).get(any(), any());
    verify(mockServer, atLeastOnce()).post(any(), any());
    verify(mockServer, never()).patch(any(), any()); //never use patch so we confirm this
  }

  // Makes sure that asking for all families returns everything in the database.
  // Also checks that the controller responds with a 200 OK.  @Test
  @Test
  void canGetAllChecklists() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(
      db.getCollection("checklists").countDocuments(),
      checklistArrayListCaptor.getValue().size());
  }

//checks that checklists were created and inserted
  @Test
  void generateDigitalChecklists(){
      Context ctx = mock(Context.class);
      //mock three mongo collections
      JacksonMongoCollection<SupplyList> supplyListCollection = mock(JacksonMongoCollection.class);
      JacksonMongoCollection<Family> familyCollection = mock(JacksonMongoCollection.class);
      JacksonMongoCollection<Checklist> checklistCollection = mock(JacksonMongoCollection.class);

      ChecklistController controller = new ChecklistController(
          familyCollection,
          supplyListCollection,
          checklistCollection
      );
      // Mock supply list
      SupplyList supply = new SupplyList();
      supply.item = "Pencils";

      FindIterable<SupplyList> supplyFind = mock(FindIterable.class);
      when(supplyListCollection.find()).thenReturn(supplyFind);
      when(supplyFind.into(anyList())).thenAnswer(inv -> {
        List<SupplyList> list = inv.getArgument(0);
        list.add(supply);
        return list;
      });

      // Mock family + students
      StudentInfo s1 = new StudentInfo();
      s1.name = "Alice";
      s1.school = "MAHS";
      s1.grade = "4";

      StudentInfo s2 = new StudentInfo();
      s2.name = "Bob";
      s2.school = "MAHS";
      s2.grade = "4";

      Family family = new Family();
      family.students = List.of(s1, s2);

      FindIterable<Family> familyFind = mock(FindIterable.class);
      when(familyCollection.find()).thenReturn(familyFind);
      when(familyFind.into(anyList())).thenAnswer(inv -> {
        List<Family> list = inv.getArgument(0);
        list.add(family);
        return list;
      });

      // Capture inserted checklists
      ArgumentCaptor<List<Checklist>> captor = ArgumentCaptor.forClass(List.class);

      // Act
      controller.generateDigitalChecklists(ctx);

      // Assert: insertMany was called with 2 checklists (one per student)
      verify(checklistCollection).insertMany(captor.capture());
      List<Checklist> inserted = captor.getValue();
      assertEquals(2, inserted.size());

      // Assert: JSON response and status
      verify(ctx).json(inserted);
      verify(ctx).status(HttpStatus.CREATED);
  }


  @Test
  void createChecklist_matchesExpectedDocument() {
    ChecklistController controller = new ChecklistController(null, null, null);

    // Arrange
    StudentInfo student = new StudentInfo();
    student.name = "Elmo";
    student.school = "MAHS";
    student.grade = "4";
    student.requestedSupplies = List.of("headphones");

    SupplyList supply = new SupplyList();
    supply.school = "MAHS";
    supply.grade = "4";
    supply.item = "Notebook";

    List<SupplyList> supplies = List.of(supply);

    Document expected = new Document()
        .append("school", "MAHS")
        .append("grade", "4")
        .append("studentName", "Elmo")
        .append("requestedSupplies", List.of("headphones"));

    // Act
    Checklist result = controller.createChecklist(student, supplies);

    Document actual = new Document()
        .append("school", result.school)
        .append("grade", result.grade)
        .append("studentName", result.studentName)
        .append("requestedSupplies", result.requestedSupplies);

    // Assert
    assertEquals(expected, actual);
  }

  // @Test
  // void canCreateChecklist() throws IOException {
  //   when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
  //   checklistController.createChecklist(ctx);

  //   verify(ctx).json(checklistArrayListCaptor.capture());
  //   verify(ctx).status(HttpStatus.OK);

  //   assertEquals(
  //     db.getCollection("checklists").countDocuments(),
  //     checklistArrayListCaptor.getValue().size());
  // }

  // Looks up a checklist using a real ID and makes sure the controller returns the
  // correct checklist and a 200 OK status.  @Test
  // Checks that the CSV export endpoint produces a properly formatted CSV string,
  // including the header and the correct student counts for each checklist.  @Test
  /*
  @Test
  void exportFamiliesAsCSVProducesCorrectCSV() {
    checklistController.exportFamiliesAsCSV(ctx);
    ArgumentCaptor<String> resultCaptor = ArgumentCaptor.forClass(String.class);

    verify(ctx).result(resultCaptor.capture());
    verify(ctx).contentType("text/csv");
    verify(ctx).status(HttpStatus.OK);

    String csv = resultCaptor.getValue();

    // Check header
    assertTrue(csv.contains(
      "Guardian Name,Email,Address,Time Slot,Number of Students"));

    // Check Jane Doe (2 students)
    assertTrue(csv.contains(
      "\"Jane Doe\",\"jane@email.com\",\"123 Street\",\"10:00-11:00\",2"));

    // Check John Christensen (2 students)
    assertTrue(csv.contains(
      "\"John Christensen\",\"jchristensen@email.com\",\"713 Broadway\",\"8:00-9:00\",2"));

    // Check John Johnson (1 student)
    assertTrue(csv.contains(
      "\"John Johnson\",\"jjohnson@email.com\",\"456 Avenue\",\"2:00-3:00\",1"));

    // Check Bob Jones (1 student)
    assertTrue(csv.contains(
      "\"Bob Jones\",\"bob@email.com\",\"456 Oak Ave\",\"2:00-3:00\",1"));
  } */
}
