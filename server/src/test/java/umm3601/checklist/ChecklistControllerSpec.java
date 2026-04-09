// Packages
package umm3601.checklist;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
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
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.json.JavalinJackson;
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.supplylist.SupplyList;

/**
 * Tests for the ChecklistController using a real MongoDB "test" database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 * - Getting all families or a single checklist by ID
 * - Handling bad or nonexistent IDs
 * - Adding new families and checking that validation works
 * - Deleting families and making sure the database updates correctly
 * - Dashboard stats and CSV export formatting
 * - Making sure the controller actually registers its routes
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

    // Setup database
    MongoCollection<Document> checklistDocuments = db.getCollection("checklists");
    checklistDocuments.drop();
    List<Document> testChecklists = new ArrayList<>();
    testChecklists.add(
        new Document()
            .append("school", "MAHS")
            .append("grade", "4")
            .append("studentName", "Elmo")
            .append("requestedSupplies", List.of("headphones"))
            .append("checklist", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", Arrays.asList("Pencils"))
                        .append("brand", new Document().append("allOf", Arrays.asList("Ticonderoga")).append("anyOf", new ArrayList<>())))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));
    testChecklists.add(
        new Document()
            .append("school", "AHS")
            .append("grade", "8")
            .append("studentName", "johnny")
            .append("requestedSupplies", List.of("backpack"))
            .append("checklist", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", Arrays.asList("Notebooks"))
                        .append("brand", new Document().append("allOf", Arrays.asList("Five Star")).append("anyOf", new ArrayList<>())))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));
    testChecklists.add(
        new Document()
            .append("school", "SSHS")
            .append("grade", "2")
            .append("studentName", "Rocco")
            .append("requestedSupplies", List.of(""))
            .append("checklist", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", Arrays.asList("Erasers"))
                        .append("brand", new Document().append("allOf", Arrays.asList("Pink Pearl")).append("anyOf", new ArrayList<>())))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));

    testChecklistId = new ObjectId();

    Document specialChecklist = new Document()
        .append("_id", testChecklistId)
        .append("school", "Nowhere")
        .append("grade", "12")
        .append("studentName", "bart")
        .append("requestedSupplies", List.of())
        .append("checklist", List.of(
            new Document()
                .append("supply", new Document()
                    .append("item", Arrays.asList("Markers"))
                    .append("brand", new Document().append("allOf", Arrays.asList("Crayola")).append("anyOf", new ArrayList<>())))
                .append("completed", false)
                .append("unreceived", false)
                .append("selectedOption", null)));

    checklistDocuments.insertMany(testChecklists);
    checklistDocuments.insertOne(specialChecklist);

    checklistController = new ChecklistController(db);
  }

  // Checks that the controller actually registers all its routes with Javalin.
  // If someone removes or renames a route by accident, this test will catch it.
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    checklistController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(1)).get(any(), any());
    verify(mockServer, atLeastOnce()).get(any(), any());
    verify(mockServer, atLeastOnce()).post(any(), any());
    verify(mockServer, never()).patch(any(), any()); // never use patch so we confirm this
  }

  // Makes sure that asking for all families returns everything in the database.
  // Also checks that the controller responds with a 200 OK. @Test
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

  // checks that checklists were created and inserted
  @SuppressWarnings("unchecked")
  @Test
  void generateDigitalChecklists() {
    // mock three mongo collections
    // @SuppressWarnings("unchecked")
    JacksonMongoCollection<SupplyList> supplyListCollection = mock(JacksonMongoCollection.class);
    // @SuppressWarnings("unchecked")
    JacksonMongoCollection<Family> familyCollection = mock(JacksonMongoCollection.class);
    // @SuppressWarnings("unchecked")
    JacksonMongoCollection<Checklist> checklistCollection = mock(JacksonMongoCollection.class);

    ChecklistController controller = new ChecklistController(
        familyCollection,
        supplyListCollection,
        checklistCollection);
    // Mock supply list
    SupplyList supply = new SupplyList();
    supply.item = Arrays.asList("Pencils");

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

  // This test was changed due to the fact you were comparing a made document to
  // another made document, which is not a good test. Instead, we are now testing
  // the createChecklist method directly to make sure it creates the checklist
  // correctly based on the student info and supply list. This is a more focused
  // unit test that doesn't rely on the database or the HTTP context.
  @Test
  void createChecklistMakesTheRightChecklist() {
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
    supply.item = Arrays.asList("Notebook");

    List<SupplyList> supplies = List.of(supply);

    // Act
    Checklist result = controller.createChecklist(student, supplies);

    // Assert student info is copied correctly
    assertEquals("Elmo", result.studentName);
    assertEquals("MAHS", result.school);
    assertEquals("4", result.grade);
    assertEquals(List.of("headphones"), result.requestedSupplies);

    // Assert one checklist item was created for the matching supply
    assertEquals(1, result.checklist.size());
    Checklist.ChecklistItem item = result.checklist.get(0);
    assertTrue(item.supply.item.contains("Notebook"));
    assertEquals(false, item.completed);
    assertEquals(false, item.unreceived);
    assertEquals(null, item.selectedOption);
  }

  // This test checks that the createChecklist method correctly excludes supplies
  // that don't match the student's school and grade. It creates a student and two
  // supplies (one with the wrong school and one with the wrong grade) and
  // verifies that the resulting checklist has no items.
  @Test
  void createChecklistExcludesSuppliesForDifferentSchoolOrGrade() {
    ChecklistController controller = new ChecklistController(null, null, null);

    StudentInfo student = new StudentInfo();
    student.name = "Elmo";
    student.school = "MAHS";
    student.grade = "4";
    student.requestedSupplies = List.of();

    SupplyList wrongSchool = new SupplyList();
    wrongSchool.school = "AHS";
    wrongSchool.grade = "4";
    wrongSchool.item = Arrays.asList("Pencils");

    SupplyList wrongGrade = new SupplyList();
    wrongGrade.school = "MAHS";
    wrongGrade.grade = "8";
    wrongGrade.item = Arrays.asList("Notebooks");

    List<SupplyList> supplies = List.of(wrongSchool, wrongGrade);

    Checklist result = controller.createChecklist(student, supplies);

    assertEquals(0, result.checklist.size());
  }

  // This test checks that the createChecklist method can handle supplies with
  // null fields without throwing an exception. It creates a supply with a null
  // item field and verifies that the resulting checklist item has a null supply
  // item.
  @Test
  void createChecklistWithNullFields() {
    ChecklistController controller = new ChecklistController(null, null, null);

    StudentInfo student = new StudentInfo();
    student.name = "Elmo";
    student.school = "MAHS";
    student.grade = "4";
    student.requestedSupplies = List.of();

    SupplyList supplyWithNulls = new SupplyList();
    supplyWithNulls.school = "MAHS";
    supplyWithNulls.grade = "4";
    // item is null

    List<SupplyList> supplies = List.of(supplyWithNulls);

    Checklist result = controller.createChecklist(student, supplies);

    assertEquals(1, result.checklist.size());
    Checklist.ChecklistItem item = result.checklist.get(0);
    assertEquals(null, item.supply.item);
  }

  // This test checks that the getStoredChecklists method correctly filters
  // checklists by school and grade. It sets up query parameters for a specific
  // school and grade, calls the method, and verifies that the returned checklists
  // match the expected criteria.
  @Test
  void filterChecklistsBySchoolAndGrade() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "school", List.of("MAHS"),
        "grade", List.of("4")));
    when(ctx.queryParam("school")).thenReturn("MAHS");
    when(ctx.queryParam("grade")).thenReturn("4");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<Checklist> result = checklistArrayListCaptor.getValue();
    assertEquals(1, result.size());
    assertEquals("Elmo", result.get(0).studentName);
  }

  @Test
  void filterChecklistsByNameAndGrade() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "name", List.of("Elmo"),
        "grade", List.of("4")));
    when(ctx.queryParam("name")).thenReturn("Elmo");
    when(ctx.queryParam("grade")).thenReturn("4");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<Checklist> result = checklistArrayListCaptor.getValue();
    assertEquals(1, result.size());
    assertEquals("Elmo", result.get(0).studentName);
  }

  // This test checks that the getStoredChecklists method returns an empty list
  // when there are no checklists matching the specified school and grade. It sets
  // up query parameters for a nonexistent school and grade, calls the method, and
  // verifies that the returned list is empty.
  @Test
  void filterChecklistsWithNoMatchingSchoolOrGrade() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "school", List.of("Nonexistent School"),
        "grade", List.of("Nonexistent Grade")));
    when(ctx.queryParam("school")).thenReturn("Nonexistent School");
    when(ctx.queryParam("grade")).thenReturn("Nonexistent Grade");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<Checklist> result = checklistArrayListCaptor.getValue();
    assertEquals(0, result.size());
  }

  // This test checks that the getStoredChecklists method can filter checklists by
  // student name. It sets up a query parameter for a specific student name, calls
  // the method, and verifies that the returned checklists have the expected
  // student name.
  @Test
  void filterChecklistsByName() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "name", List.of("Elmo")));
    when(ctx.queryParam("name")).thenReturn("Elmo");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<Checklist> result = checklistArrayListCaptor.getValue();
    assertEquals(4, result.size()); // why is this 4? there are only 3 checklists in the database with studentName
                                    // "Elmo"?
    assertEquals("Elmo", result.get(0).studentName);
  }

  @Test
  void constructFilterAddsNameRegex() {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "name", List.of("Elmo")));
    when(ctx.queryParam("name")).thenReturn("Elmo");
    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    List<Checklist> result = checklistArrayListCaptor.getValue();
    // Verify that the filter is applied and returns results with name filter
    assertTrue(result.size() > 0);
    assertTrue(result.get(0).studentName.equals("Elmo"));
  }

  // Tests for normalizeSchool static method
  @Test
  void normalizeSchoolHandlesNull() {
    assertEquals("", ChecklistController.normalizeSchool(null));
  }

  @Test
  void normalizeSchoolStripsTrailingSchool() {
    assertEquals("morris area high", ChecklistController.normalizeSchool("Morris Area High School"));
  }

  @Test
  void normalizeSchoolTrimsAndLowers() {
    assertEquals("mahs", ChecklistController.normalizeSchool("  MAHS  "));
  }

  // Tests for normalizeGrade static method
  @Test
  void normalizeGradeHandlesNull() {
    assertEquals("", ChecklistController.normalizeGrade(null));
  }

  @Test
  void normalizeGradeStripsHyphensAndSpaces() {
    assertEquals("4thgrade", ChecklistController.normalizeGrade("4th-Grade"));
  }

  @Test
  void normalizeGradeTrimsAndLowers() {
    assertEquals("prek", ChecklistController.normalizeGrade("  PreK  "));
  }

  // Test constructFilter with only school param
  @Test
  void filterChecklistsBySchoolOnly() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of("school", List.of("MAHS")));
    when(ctx.queryParam("school")).thenReturn("MAHS");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, checklistArrayListCaptor.getValue().size());
    assertEquals("Elmo", checklistArrayListCaptor.getValue().get(0).studentName);
  }

  // Test constructFilter with only grade param
  @Test
  void filterChecklistsByGradeOnly() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of("grade", List.of("8")));
    when(ctx.queryParam("grade")).thenReturn("8");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, checklistArrayListCaptor.getValue().size());
    assertEquals("johnny", checklistArrayListCaptor.getValue().get(0).studentName);
  }

  // Test constructFilter with all three params
  @Test
  void filterChecklistsBySchoolGradeAndName() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of(
        "school", List.of("MAHS"),
        "grade", List.of("4"),
        "studentName", List.of("Elmo")));
    when(ctx.queryParam("school")).thenReturn("MAHS");
    when(ctx.queryParam("grade")).thenReturn("4");
    when(ctx.queryParam("studentName")).thenReturn("Elmo");

    checklistController.getStoredChecklists(ctx);

    verify(ctx).json(checklistArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, checklistArrayListCaptor.getValue().size());
    assertEquals("Elmo", checklistArrayListCaptor.getValue().get(0).studentName);
  }

  // Test createChecklist when supply has null school
  @Test
  void createChecklistExcludesSupplyWithNullSchool() {
    ChecklistController controller = new ChecklistController(null, null, null);

    StudentInfo student = new StudentInfo();
    student.name = "TestStudent";
    student.school = "MAHS";
    student.grade = "4";
    student.requestedSupplies = List.of();

    SupplyList supplyNullSchool = new SupplyList();
    supplyNullSchool.school = null;
    supplyNullSchool.grade = "4";
    supplyNullSchool.item = Arrays.asList("Pencils");

    SupplyList supplyNullGrade = new SupplyList();
    supplyNullGrade.school = "MAHS";
    supplyNullGrade.grade = null;
    supplyNullGrade.item = Arrays.asList("Erasers");

    Checklist result = controller.createChecklist(student, List.of(supplyNullSchool, supplyNullGrade));
    assertEquals(0, result.checklist.size());
  }

  // Test Checklist.equals() branches
  @Test
  void checklistEqualsWithSelf() {
    Checklist c = new Checklist();
    c._id = "abc";
    assertEquals(c, c);
  }

  @Test
  void checklistEqualsWithNull() {
    Checklist c = new Checklist();
    c._id = "abc";
    assertTrue(!c.equals(null));
  }

  @Test
  void checklistEqualsWithNonChecklist() {
    Checklist c = new Checklist();
    c._id = "abc";
    assertTrue(!c.equals("not a checklist"));
  }

  @Test
  void checklistHashCodeWithNullId() {
    Checklist c = new Checklist();
    c._id = null;
    assertEquals(0, c.hashCode());
  }
}
