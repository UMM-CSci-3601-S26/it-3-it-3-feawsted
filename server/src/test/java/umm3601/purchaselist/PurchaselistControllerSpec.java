//Packages
package umm3601.purchaselist;

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
import umm3601.inventory.InventoryController;
import umm3601.settings.Settings;
import umm3601.checklist.Checklist;
import umm3601.checklist.ChecklistController;

// /**
//  * Tests for the PurchaselistController using a real MongoDB "test" database.
//  *
//  * These tests make sure the controller behaves the way the rest of the app
//  * expects it to. They cover:
//  * - Getting all families or a single purchaselist by ID
//  * - Handling bad or nonexistent IDs
//  * - Adding new families and checking that validation works
//  * - Deleting families and making sure the database updates correctly
//  * - Dashboard stats and CSV export formatting
//  * - Making sure the controller actually registers its routes
//  *
//  * Each test starts with a clean set of purchaselist documents so results are
//  * predictable and easy to understand.
//  */

// // Tests for the Purchaselist Controller
@SuppressWarnings({ "MagicNumber" })
class PurchaselistControllerSpec {

  private PurchaselistController purchaselistController;
  private ObjectId testPurchaselistId;

  private InventoryController inventoryController;
  private ObjectId inventoryId;

  private ChecklistController checklistController;
  private ObjectId testChecklistId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Purchaselist>> purchaselistArrayListCaptor;

  @Captor
  private ArgumentCaptor<Purchaselist> purchaselistCaptor;

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


  // Runs before every single test. We clear out the inventory collection,
  // insert a small set of sample items, and reset all the mocks.
  // This makes sure each test starts fresh and doesn’t get messed up by
  // whatever happened in a previous test.
  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    // Setup Inventory database
    MongoCollection<Document> inventoryDocuments = db.getCollection("inventory");
    inventoryDocuments.drop();
    List<Document> testInventory = new ArrayList<>();
    testInventory.add(
        new Document()
            .append("item", "pencil")
            .append("brand", "Ticonderoga")
            .append("color", "yellow")
            .append("count", 1)
            .append("size", "")
            .append("quantity", 10)
            .append("notes", "")
            .append("type", List.of("#2"))
            .append("style", List.of("hexagonal"))
            .append("material", List.of("wood"))
            .append("bin", List.of(1)));
    testInventory.add(
        new Document()
            .append("item", "eraser")
            .append("brand", "Pink Pearl")
            .append("color", "pink")
            .append("count", 1)
            .append("size", "small")
            .append("quantity", 5)
            .append("notes", "")
            .append("type", List.of())
            .append("style", List.of())
            .append("material", List.of("rubber"))
            .append("bin", List.of(2)));
    testInventory.add(
        new Document()
            .append("item", "notebook")
            .append("brand", "Five Star")
            .append("color", "blue")
            .append("count", 1)
            .append("size", "")
            .append("quantity", 3)
            .append("notes", "")
            .append("type", List.of("spiral"))
            .append("style", List.of("wide ruled"))
            .append("material", List.of("paper"))
            .append("bin", List.of(3)));

    inventoryId = new ObjectId();
    Document sam = new Document()
        .append("_id", inventoryId)
        .append("item", "backpack")
        .append("brand", "JanSport")
        .append("color", "black")
        .append("count", 1)
        .append("size", "standard")
        .append("quantity", 2)
        .append("notes", "Plain colors only")
        .append("type", List.of("shoulder bag"))
        .append("style", List.of())
        .append("material", List.of("fabric"))
        .append("bin", List.of(4, 5));

    inventoryDocuments.insertMany(testInventory);
    inventoryDocuments.insertOne(sam);

    inventoryController = new InventoryController(db);
    }

    // Setup Supplylist database
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
                        .append("brand", new Document()
                        .append("allOf", Arrays.asList("Ticonderoga"))
                        .append("anyOf", new ArrayList<>())))
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
                        .append("brand", new Document()
                        .append("allOf", Arrays.asList("Five Star"))
                        .append("anyOf", new ArrayList<>())))
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
                        .append("brand", new Document()
                        .append("allOf", Arrays.asList("Pink Pearl"))
                        .append("anyOf", new ArrayList<>())))
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
                    .append("brand", new Document().append("allOf", Arrays.asList("Crayola"))
                    .append("anyOf", new ArrayList<>())))
                .append("completed", false)
                .append("unreceived", false)
                .append("selectedOption", null)));

    checklistDocuments.insertMany(testChecklists);
    checklistDocuments.insertOne(specialChecklist);

    checklistController = new ChecklistController(db);
  }}


  //test for checking if a needs list is being made


  //test for if purchase list is being generated

//   // Runs before every test. We clear out the families collection, insert a small
//   // set of sample families, and reset all the mocks. This keeps each test
//   // independent so nothing gets messed up by a previous test.
//   @BeforeEach
//   void setupEach() throws IOException {
//     MockitoAnnotations.openMocks(this);

//     // Setup database
//     MongoCollection<Document> purchaselistDocuments = db.getCollection("purchaselists");
//     purchaselistDocuments.drop();
//     List<Document> testPurchaselists = new ArrayList<>();
//     testPurchaselists.add(
//         new Document()
//             .append("school", "MAHS")
//             .append("grade", "4")
//             .append("studentName", "Elmo")
//             .append("requestedSupplies", List.of("headphones"))
//             .append("purchaselist", List.of(
//                 new Document()
//                     .append("supply", new Document()
//                         .append("item", Arrays.asList("Pencils"))
//                         .append("brand", new Document()
//                         .append("allOf", Arrays.asList("Ticonderoga"))
//                         .append("anyOf", new ArrayList<>())))
//                     .append("completed", false)
//                     .append("unreceived", false)
//                     .append("selectedOption", null))));
//     testPurchaselists.add(
//         new Document()
//             .append("school", "AHS")
//             .append("grade", "8")
//             .append("studentName", "johnny")
//             .append("requestedSupplies", List.of("backpack"))
//             .append("purchaselist", List.of(
//                 new Document()
//                     .append("supply", new Document()
//                         .append("item", Arrays.asList("Notebooks"))
//                         .append("brand", new Document()
//                         .append("allOf", Arrays.asList("Five Star"))
//                         .append("anyOf", new ArrayList<>())))
//                     .append("completed", false)
//                     .append("unreceived", false)
//                     .append("selectedOption", null))));
//     testPurchaselists.add(
//         new Document()
//             .append("school", "SSHS")
//             .append("grade", "2")
//             .append("studentName", "Rocco")
//             .append("requestedSupplies", List.of(""))
//             .append("purchaselist", List.of(
//                 new Document()
//                     .append("supply", new Document()
//                         .append("item", Arrays.asList("Erasers"))
//                         .append("brand", new Document()
//                         .append("allOf", Arrays.asList("Pink Pearl"))
//                         .append("anyOf", new ArrayList<>())))
//                     .append("completed", false)
//                     .append("unreceived", false)
//                     .append("selectedOption", null))));

//     testPurchaselistId = new ObjectId();

//     Document specialPurchaselist = new Document()
//         .append("_id", testPurchaselistId)
//         .append("school", "Nowhere")
//         .append("grade", "12")
//         .append("studentName", "bart")
//         .append("requestedSupplies", List.of())
//         .append("purchaselist", List.of(
//             new Document()
//                 .append("supply", new Document()
//                     .append("item", Arrays.asList("Markers"))
//                     .append("brand", new Document().append("allOf", Arrays.asList("Crayola"))
//                     .append("anyOf", new ArrayList<>())))
//                 .append("completed", false)
//                 .append("unreceived", false)
//                 .append("selectedOption", null)));

//     purchaselistDocuments.insertMany(testPurchaselists);
//     purchaselistDocuments.insertOne(specialPurchaselist);

//     purchaselistController = new PurchaselistController(db);
//   }

//   // Checks that the controller actually registers all its routes with Javalin.
//   // If someone removes or renames a route by accident, this test will catch it.
//   @Test
//   void addsRoutes() {
//     Javalin mockServer = mock(Javalin.class);
//     purchaselistController.addRoutes(mockServer);

//     verify(mockServer, Mockito.atLeast(1)).get(any(), any());
//     verify(mockServer, atLeastOnce()).get(any(), any());
//     verify(mockServer, atLeastOnce()).post(any(), any());
//     verify(mockServer, never()).patch(any(), any()); // never use patch so we confirm this
//   }

//   // Makes sure that asking for all families returns everything in the database.
//   // Also checks that the controller responds with a 200 OK. @Test
//   @Test
//   void canGetAllPurchaselists() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     assertEquals(
//         db.getCollection("purchaselists").countDocuments(),
//         purchaselistArrayListCaptor.getValue().size());
//   }

//   // checks that purchaselists were created and inserted
//   @SuppressWarnings("unchecked")
//   @Test
//   void generateDigitalPurchaselists() {
//     // mock three mongo collections
//     // @SuppressWarnings("unchecked")
//     JacksonMongoCollection<SupplyList> supplyListCollection = mock(JacksonMongoCollection.class);
//     // @SuppressWarnings("unchecked")
//     JacksonMongoCollection<Family> familyCollection = mock(JacksonMongoCollection.class);
//     // @SuppressWarnings("unchecked")
//     JacksonMongoCollection<Purchaselist> purchaselistCollection = mock(JacksonMongoCollection.class);

//     PurchaselistController controller = new PurchaselistController(
//         familyCollection,
//         supplyListCollection,
//         purchaselistCollection);
//     // Mock supply list
//     SupplyList supply = new SupplyList();
//     supply.item = Arrays.asList("Pencils");

//     FindIterable<SupplyList> supplyFind = mock(FindIterable.class);
//     when(supplyListCollection.find()).thenReturn(supplyFind);
//     when(supplyFind.into(anyList())).thenAnswer(inv -> {
//       List<SupplyList> list = inv.getArgument(0);
//       list.add(supply);
//       return list;
//     });

//     // Mock family + students
//     StudentInfo s1 = new StudentInfo();
//     s1.name = "Alice";
//     s1.school = "MAHS";
//     s1.grade = "4";

//     StudentInfo s2 = new StudentInfo();
//     s2.name = "Bob";
//     s2.school = "MAHS";
//     s2.grade = "4";

//     Family family = new Family();
//     family.students = List.of(s1, s2);

//     FindIterable<Family> familyFind = mock(FindIterable.class);
//     when(familyCollection.find()).thenReturn(familyFind);
//     when(familyFind.into(anyList())).thenAnswer(inv -> {
//       List<Family> list = inv.getArgument(0);
//       list.add(family);
//       return list;
//     });

//     // Capture inserted purchaselists
//     ArgumentCaptor<List<Purchaselist>> captor = ArgumentCaptor.forClass(List.class);

//     // Act
//     controller.generateDigitalPurchaselists(ctx);

//     // Assert: insertMany was called with 2 purchaselists (one per student)
//     verify(purchaselistCollection).insertMany(captor.capture());
//     List<Purchaselist> inserted = captor.getValue();
//     assertEquals(2, inserted.size());

//     // Assert: JSON response and status
//     verify(ctx).json(inserted);
//     verify(ctx).status(HttpStatus.CREATED);
//   }

//   // This test was changed due to the fact you were comparing a made document to
//   // another made document, which is not a good test. Instead, we are now testing
//   // the createPurchaselist method directly to make sure it creates the purchaselist
//   // correctly based on the student info and supply list. This is a more focused
//   // unit test that doesn't rely on the database or the HTTP context.
//   @Test
//   void createPurchaselistMakesTheRightPurchaselist() {
//     PurchaselistController controller = new PurchaselistController(null, null, null);

//     // Arrange
//     StudentInfo student = new StudentInfo();
//     student.name = "Elmo";
//     student.school = "MAHS";
//     student.grade = "4";
//     student.requestedSupplies = List.of("headphones");

//     SupplyList supply = new SupplyList();
//     supply.school = "MAHS";
//     supply.grade = "4";
//     supply.item = Arrays.asList("Notebook");

//     List<SupplyList> supplies = List.of(supply);

//     // Act
//     Purchaselist result = controller.createPurchaselist(student, supplies);

//     // Assert student info is copied correctly
//     assertEquals("Elmo", result.studentName);
//     assertEquals("MAHS", result.school);
//     assertEquals("4", result.grade);
//     assertEquals(List.of("headphones"), result.requestedSupplies);

//     // Assert one purchaselist item was created for the matching supply
//     assertEquals(1, result.purchaselist.size());
//     Purchaselist.PurchaselistItem item = result.purchaselist.get(0);
//     assertTrue(item.supply.item.contains("Notebook"));
//     assertEquals(false, item.completed);
//     assertEquals(false, item.unreceived);
//     assertEquals(null, item.selectedOption);
//   }

//   // This test checks that the createPurchaselist method correctly excludes supplies
//   // that don't match the student's school and grade. It creates a student and two
//   // supplies (one with the wrong school and one with the wrong grade) and
//   // verifies that the resulting purchaselist has no items.
//   @Test
//   void createPurchaselistExcludesSuppliesForDifferentSchoolOrGrade() {
//     PurchaselistController controller = new PurchaselistController(null, null, null);

//     StudentInfo student = new StudentInfo();
//     student.name = "Elmo";
//     student.school = "MAHS";
//     student.grade = "4";
//     student.requestedSupplies = List.of();

//     SupplyList wrongSchool = new SupplyList();
//     wrongSchool.school = "AHS";
//     wrongSchool.grade = "4";
//     wrongSchool.item = Arrays.asList("Pencils");

//     SupplyList wrongGrade = new SupplyList();
//     wrongGrade.school = "MAHS";
//     wrongGrade.grade = "8";
//     wrongGrade.item = Arrays.asList("Notebooks");

//     List<SupplyList> supplies = List.of(wrongSchool, wrongGrade);

//     Purchaselist result = controller.createPurchaselist(student, supplies);

//     assertEquals(0, result.purchaselist.size());
//   }

//   // This test checks that the createPurchaselist method can handle supplies with
//   // null fields without throwing an exception. It creates a supply with a null
//   // item field and verifies that the resulting purchaselist item has a null supply
//   // item.
//   @Test
//   void createPurchaselistWithNullFields() {
//     PurchaselistController controller = new PurchaselistController(null, null, null);

//     StudentInfo student = new StudentInfo();
//     student.name = "Elmo";
//     student.school = "MAHS";
//     student.grade = "4";
//     student.requestedSupplies = List.of();

//     SupplyList supplyWithNulls = new SupplyList();
//     supplyWithNulls.school = "MAHS";
//     supplyWithNulls.grade = "4";
//     // item is null

//     List<SupplyList> supplies = List.of(supplyWithNulls);

//     Purchaselist result = controller.createPurchaselist(student, supplies);

//     assertEquals(1, result.purchaselist.size());
//     Purchaselist.PurchaselistItem item = result.purchaselist.get(0);
//     assertEquals(null, item.supply.item);
//   }

//   // This test checks that the getStoredPurchaselists method correctly filters
//   // purchaselists by school and grade. It sets up query parameters for a specific
//   // school and grade, calls the method, and verifies that the returned purchaselists
//   // match the expected criteria.
//   @Test
//   void filterPurchaselistsBySchoolAndGrade() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "school", List.of("MAHS"),
//         "grade", List.of("4")));
//     when(ctx.queryParam("school")).thenReturn("MAHS");
//     when(ctx.queryParam("grade")).thenReturn("4");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     List<Purchaselist> result = purchaselistArrayListCaptor.getValue();
//     assertEquals(1, result.size());
//     assertEquals("Elmo", result.get(0).studentName);
//   }

//   @Test
//   void filterPurchaselistsByNameAndGrade() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "name", List.of("Elmo"),
//         "grade", List.of("4")));
//     when(ctx.queryParam("name")).thenReturn("Elmo");
//     when(ctx.queryParam("grade")).thenReturn("4");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     List<Purchaselist> result = purchaselistArrayListCaptor.getValue();
//     assertEquals(1, result.size());
//     assertEquals("Elmo", result.get(0).studentName);
//   }

//   // This test checks that the getStoredPurchaselists method returns an empty list
//   // when there are no purchaselists matching the specified school and grade. It sets
//   // up query parameters for a nonexistent school and grade, calls the method, and
//   // verifies that the returned list is empty.
//   @Test
//   void filterPurchaselistsWithNoMatchingSchoolOrGrade() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "school", List.of("Nonexistent School"),
//         "grade", List.of("Nonexistent Grade")));
//     when(ctx.queryParam("school")).thenReturn("Nonexistent School");
//     when(ctx.queryParam("grade")).thenReturn("Nonexistent Grade");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     List<Purchaselist> result = purchaselistArrayListCaptor.getValue();
//     assertEquals(0, result.size());
//   }

//   // This test checks that the getStoredPurchaselists method can filter purchaselists by
//   // student name. It sets up a query parameter for a specific student name, calls
//   // the method, and verifies that the returned purchaselists have the expected
//   // student name.
//   @Test
//   void filterPurchaselistsByName() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "name", List.of("Elmo")));
//     when(ctx.queryParam("name")).thenReturn("Elmo");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     List<Purchaselist> result = purchaselistArrayListCaptor.getValue();
//     assertEquals(4, result.size()); // why is this 4? there are only 3 purchaselists in the database with studentName
//                                     // "Elmo"?
//     assertEquals("Elmo", result.get(0).studentName);
//   }

//   @Test
//   void constructFilterAddsNameRegex() {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "name", List.of("Elmo")));
//     when(ctx.queryParam("name")).thenReturn("Elmo");
//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     List<Purchaselist> result = purchaselistArrayListCaptor.getValue();
//     // Verify that the filter is applied and returns results with name filter
//     assertTrue(result.size() > 0);
//     assertTrue(result.get(0).studentName.equals("Elmo"));
//   }

//   // Tests for normalizeSchool static method
//   @Test
//   void normalizeSchoolHandlesNull() {
//     assertEquals("", PurchaselistController.normalizeSchool(null));
//   }

//   @Test
//   void normalizeSchoolStripsTrailingSchool() {
//     assertEquals("morris area high", PurchaselistController.normalizeSchool("Morris Area High School"));
//   }

//   @Test
//   void normalizeSchoolTrimsAndLowers() {
//     assertEquals("mahs", PurchaselistController.normalizeSchool("  MAHS  "));
//   }

//   // Tests for normalizeGrade static method
//   @Test
//   void normalizeGradeHandlesNull() {
//     assertEquals("", PurchaselistController.normalizeGrade(null));
//   }

//   @Test
//   void normalizeGradeStripsHyphensAndSpaces() {
//     assertEquals("4thgrade", PurchaselistController.normalizeGrade("4th-Grade"));
//   }

//   @Test
//   void normalizeGradeTrimsAndLowers() {
//     assertEquals("prek", PurchaselistController.normalizeGrade("  PreK  "));
//   }

//   // Test constructFilter with only school param
//   @Test
//   void filterPurchaselistsBySchoolOnly() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of("school", List.of("MAHS")));
//     when(ctx.queryParam("school")).thenReturn("MAHS");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     assertEquals(1, purchaselistArrayListCaptor.getValue().size());
//     assertEquals("Elmo", purchaselistArrayListCaptor.getValue().get(0).studentName);
//   }

//   // Test constructFilter with only grade param
//   @Test
//   void filterPurchaselistsByGradeOnly() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of("grade", List.of("8")));
//     when(ctx.queryParam("grade")).thenReturn("8");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     assertEquals(1, purchaselistArrayListCaptor.getValue().size());
//     assertEquals("johnny", purchaselistArrayListCaptor.getValue().get(0).studentName);
//   }

//   // Test constructFilter with all three params
//   @Test
//   void filterPurchaselistsBySchoolGradeAndName() throws IOException {
//     when(ctx.queryParamMap()).thenReturn(Map.of(
//         "school", List.of("MAHS"),
//         "grade", List.of("4"),
//         "studentName", List.of("Elmo")));
//     when(ctx.queryParam("school")).thenReturn("MAHS");
//     when(ctx.queryParam("grade")).thenReturn("4");
//     when(ctx.queryParam("studentName")).thenReturn("Elmo");

//     purchaselistController.getStoredPurchaselists(ctx);

//     verify(ctx).json(purchaselistArrayListCaptor.capture());
//     verify(ctx).status(HttpStatus.OK);

//     assertEquals(1, purchaselistArrayListCaptor.getValue().size());
//     assertEquals("Elmo", purchaselistArrayListCaptor.getValue().get(0).studentName);
//   }

//   // Test createPurchaselist when supply has null school
//   @Test
//   void createPurchaselistExcludesSupplyWithNullSchool() {
//     PurchaselistController controller = new PurchaselistController(null, null, null);

//     StudentInfo student = new StudentInfo();
//     student.name = "TestStudent";
//     student.school = "MAHS";
//     student.grade = "4";
//     student.requestedSupplies = List.of();

//     SupplyList supplyNullSchool = new SupplyList();
//     supplyNullSchool.school = null;
//     supplyNullSchool.grade = "4";
//     supplyNullSchool.item = Arrays.asList("Pencils");

//     SupplyList supplyNullGrade = new SupplyList();
//     supplyNullGrade.school = "MAHS";
//     supplyNullGrade.grade = null;
//     supplyNullGrade.item = Arrays.asList("Erasers");

//     Purchaselist result = controller.createPurchaselist(student, List.of(supplyNullSchool, supplyNullGrade));
//     assertEquals(0, result.purchaselist.size());
//   }

//   // Test Purchaselist.equals() branches
//   @Test
//   void purchaselistEqualsWithSelf() {
//     Purchaselist c = new Purchaselist();
//     c._id = "abc";
//     assertEquals(c, c);
//   }

//   @Test
//   void purchaselistEqualsWithNull() {
//     Purchaselist c = new Purchaselist();
//     c._id = "abc";
//     assertTrue(!c.equals(null));
//   }

//   @Test
//   void purchaselistEqualsWithNonPurchaselist() {
//     Purchaselist c = new Purchaselist();
//     c._id = "abc";
//     assertTrue(!c.equals("not a purchaselist"));
//   }

//   @Test
//   void purchaselistHashCodeWithNullId() {
//     Purchaselist c = new Purchaselist();
//     c._id = null;
//     assertEquals(0, c.hashCode());
//   }

//   // ---- expandHighSchoolSupplies unit tests ----

//   // Helper: build a minimal SupplyList with school + grade + one item
//   private SupplyList makeSchoolSupply(String school, String grade, String item) {
//     SupplyList s = new SupplyList();
//     s.school = school;
//     s.grade = grade;
//     s.item = Arrays.asList(item);
//     s.brand = new SupplyList.AttributeOptions();
//     s.brand.allOf = new ArrayList<>();
//     s.brand.anyOf = new ArrayList<>();
//     s.color = new SupplyList.AttributeOptions();
//     s.color.allOf = new ArrayList<>();
//     s.color.anyOf = new ArrayList<>();
//     s.type = new SupplyList.AttributeOptions();
//     s.type.allOf = new ArrayList<>();
//     s.type.anyOf = new ArrayList<>();
//     s.style = new SupplyList.AttributeOptions();
//     s.style.allOf = new ArrayList<>();
//     s.style.anyOf = new ArrayList<>();
//     s.material = new SupplyList.AttributeOptions();
//     s.material.allOf = new ArrayList<>();
//     s.material.anyOf = new ArrayList<>();
//     s.size = "";
//     s.quantity = 1;
//     s.count = 1;
//     s.notes = "";
//     return s;
//   }

//   // A "High School" entry expands into separate copies for grades 9–12
//   @Test
//   void expandHighSchoolExpandsToFourGrades() {
//     SupplyList hs = makeSchoolSupply("MAHS", "High School", "Notebook");
//     List<SupplyList> result = PurchaselistController.expandHighSchoolSupplies(List.of(hs));

//     assertEquals(4, result.size());
//     List<String> grades = result.stream().map(s -> s.grade).toList();
//     assertTrue(grades.contains("9"));
//     assertTrue(grades.contains("10"));
//     assertTrue(grades.contains("11"));
//     assertTrue(grades.contains("12"));
//     // The original "High School" entry must not appear in the output
//     assertTrue(result.stream().noneMatch(s -> "High School".equalsIgnoreCase(s.grade)));
//   }

//   // If a specific grade already exists at the same school, that grade is skipped during expansion
//   @Test
//   void expandHighSchoolSkipsGradeWithExistingEntry() {
//     SupplyList existing10 = makeSchoolSupply("MAHS", "10", "Pencils");
//     SupplyList hs = makeSchoolSupply("MAHS", "High School", "Notebook");

//     List<SupplyList> result = PurchaselistController.expandHighSchoolSupplies(List.of(existing10, hs));

//     // Grade 10 already had an entry, so expansion should only add 9, 11, 12 (not a duplicate 10)
//     long hsExpanded = result.stream()
//         .filter(s -> "MAHS".equals(s.school) && List.of("9", "10", "11", "12").contains(s.grade))
//         .count();
//     assertEquals(4, hsExpanded); // existing 10 + new 9, 11, 12
//     long grade10Count = result.stream()
//         .filter(s -> "MAHS".equals(s.school) && "10".equals(s.grade))
//         .count();
//     assertEquals(1, grade10Count); // only the original, not a duplicate
//   }

//   // Supply entries for non-HS grades are left completely untouched
//   @Test
//   void expandHighSchoolLeavesOtherGradesAlone() {
//     SupplyList grade8 = makeSchoolSupply("MAHS", "8", "Scissors");
//     SupplyList preK = makeSchoolSupply("MAHS", "Pre-K", "Crayons");

//     List<SupplyList> result = PurchaselistController.expandHighSchoolSupplies(List.of(grade8, preK));

//     assertEquals(2, result.size());
//     assertEquals("8", result.get(0).grade);
//     assertEquals("Pre-K", result.get(1).grade);
//   }

//   // copyWithGrade preserves all fields and only changes the grade
//   @Test
//   void copyWithGradePreservesFieldsAndChangesGrade() {
//     SupplyList source = makeSchoolSupply("MAHS", "High School", "Ruler");
//     source.teacher = "Smith";
//     source.academicYear = "2025-2026";
//     source.quantity = 3;
//     source.count = 2;
//     source.notes = "Brand new";

//     SupplyList copy = PurchaselistController.copyWithGrade(source, "11");

//     assertEquals("11", copy.grade);
//     assertEquals("MAHS", copy.school);
//     assertTrue(copy.item.contains("Ruler"));
//     assertEquals("Smith", copy.teacher);
//     assertEquals("2025-2026", copy.academicYear);
//     assertEquals(3, copy.quantity);
//     assertEquals(2, copy.count);
//     assertEquals("Brand new", copy.notes);
//     // _id must NOT be copied — copies are transient
//     assertEquals(null, copy._id);
//   }

//   // "HIGH SCHOOL" and "high school" normalize the same way and also expand
//   @Test
//   void expandHighSchoolIsCaseInsensitive() {
//     SupplyList upperCase = makeSchoolSupply("MAHS", "HIGH SCHOOL", "Notebook");
//     SupplyList lowerCase = makeSchoolSupply("MHS", "high school", "Folder");

//     List<SupplyList> result = PurchaselistController.expandHighSchoolSupplies(
//         List.of(upperCase, lowerCase));

//     // 4 copies for MAHS + 4 copies for MHS = 8
//     assertEquals(8, result.size());
//     assertTrue(result.stream().noneMatch(s -> "HIGH SCHOOL".equalsIgnoreCase(s.grade)));
//   }

//   // Entries with null school or null grade are passed through without expansion or crashing
//   @Test
//   void expandHighSchoolNullSchoolOrGradePassesThrough() {
//     SupplyList nullSchool = new SupplyList();
//     nullSchool.school = null;
//     nullSchool.grade = "High School";
//     nullSchool.item = Arrays.asList("Pencils");

//     SupplyList nullGrade = new SupplyList();
//     nullGrade.school = "MAHS";
//     nullGrade.grade = null;
//     nullGrade.item = Arrays.asList("Erasers");

//     // Should not throw; null-school/null-grade entries are kept as-is
//     List<SupplyList> result = PurchaselistController.expandHighSchoolSupplies(
//         List.of(nullSchool, nullGrade));

//     assertEquals(2, result.size());
//   }

//   // ---- applySupplyOrder unit tests ----

//   // Helper: build a SupplyItemOrder entry
//   private Settings.SupplyItemOrder orderEntry(String term, String status) {
//     Settings.SupplyItemOrder e = new Settings.SupplyItemOrder();
//     e.itemTerm = term;
//     e.status = status;
//     return e;
//   }

//   // Helper: build a SupplyList with optional item terms
//   private SupplyList makeSupply(String... items) {
//     SupplyList s = new SupplyList();
//     s.item = (items.length > 0) ? Arrays.asList(items) : null;
//     return s;
//   }

//   // Empty order list → all supplies returned, original order preserved
//   @Test
//   void applySupplyOrderEmptyOrderReturnsAllSupplies() {
//     SupplyList a = makeSupply("notebook");
//     SupplyList b = makeSupply("folder");
//     List<SupplyList> supplies = List.of(a, b);

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(supplies, List.of());

//     assertEquals(2, result.size());
//   }

//   // Staged terms dictate order: notebook before folder regardless of input order
//   @Test
//   void applySupplyOrderStagedTermsPreserveDefinedOrder() {
//     SupplyList folderSupply = makeSupply("folder");
//     SupplyList notebookSupply = makeSupply("notebook");
//     List<SupplyList> supplies = List.of(folderSupply, notebookSupply);

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("notebook", "staged"),
//         orderEntry("folder", "staged"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(supplies, order);

//     assertEquals(2, result.size());
//     assertTrue(result.get(0).item.contains("notebook"));
//     assertTrue(result.get(1).item.contains("folder"));
//   }

//   // notGiven supplies are excluded entirely
//   @Test
//   void applySupplyOrderNotGivenTermsAreExcluded() {
//     SupplyList pencilSupply = makeSupply("pencil");
//     SupplyList notebookSupply = makeSupply("notebook");
//     List<SupplyList> supplies = List.of(pencilSupply, notebookSupply);

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("pencil", "notGiven"),
//         orderEntry("notebook", "staged"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(supplies, order);

//     assertEquals(1, result.size());
//     assertTrue(result.get(0).item.contains("notebook"));
//   }

//   // Unstaged supplies appear after all staged supplies
//   @Test
//   void applySupplyOrderUnstagedComesAfterStaged() {
//     SupplyList folderSupply = makeSupply("folder");  // unstaged
//     SupplyList notebookSupply = makeSupply("notebook");  // staged

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("notebook", "staged"),
//         orderEntry("folder", "unstaged"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(
//         List.of(folderSupply, notebookSupply), order);

//     assertEquals(2, result.size());
//     assertTrue(result.get(0).item.contains("notebook"));
//     assertTrue(result.get(1).item.contains("folder"));
//   }

//   // Multiple supplies sharing same term both sort together before another term
//   @Test
//   void applySupplyOrderMultipleSuppliesWithSameTermAllOrdered() {
//     SupplyList spiralNotebook = makeSupply("notebook");
//     SupplyList compositionNotebook = makeSupply("notebook");
//     SupplyList folderSupply = makeSupply("folder");

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("notebook", "staged"),
//         orderEntry("folder", "staged"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(
//         List.of(folderSupply, spiralNotebook, compositionNotebook), order);

//     assertEquals(3, result.size());
//     // folder (index=1) comes after both notebooks (index=0)
//     assertTrue(result.get(0).item.contains("notebook"));
//     assertTrue(result.get(1).item.contains("notebook"));
//     assertTrue(result.get(2).item.contains("folder"));
//   }

//   // Supply with null item list is kept (not excluded) and sorted to end
//   @Test
//   void applySupplyOrderNullItemListKeptAndSortedLast() {
//     SupplyList notebookSupply = makeSupply("notebook");
//     SupplyList nullItemSupply = makeSupply(); // item will be null

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("notebook", "staged"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(
//         List.of(nullItemSupply, notebookSupply), order);

//     assertEquals(2, result.size());
//     assertTrue(result.get(0).item.contains("notebook"));
//     assertEquals(null, result.get(1).item);
//   }

//   // Supply whose item list contains one notGiven term is excluded
//   // even if the item list also contains other non-notGiven terms
//   @Test
//   void applySupplyOrderExcludesSupplyWithAnyNotGivenTerm() {
//     // This supply has both "notebook" (staged) and "pencil" (notGiven)
//     SupplyList mixedSupply = makeSupply("notebook", "pencil");

//     List<Settings.SupplyItemOrder> order = List.of(
//         orderEntry("notebook", "staged"),
//         orderEntry("pencil", "notGiven"));

//     List<SupplyList> result = PurchaselistController.applySupplyOrder(
//         List.of(mixedSupply), order);

//     assertEquals(0, result.size());
//   }
// }
