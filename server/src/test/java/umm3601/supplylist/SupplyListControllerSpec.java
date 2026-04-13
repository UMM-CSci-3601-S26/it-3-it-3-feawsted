// Packages
package umm3601.supplylist;

// Static Imports
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
 * Tests for the SupplyListController using a real MongoDB "test" database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 * - Getting all supply list items or a single item by ID
 * - Handling bad or nonexistent IDs
 * - Filtering supply list items by lots of fields (item, brand, school, grade,
 * etc.)
 * and making sure filters work even with weird capitalization
 * - Rejecting invalid numeric filters
 * - Making sure the controller registers its routes with Javalin
 *
 * Each test starts with a clean set of supply list documents so results are
 * predictable and easy to understand.
 */

// Tests for the Supply List Controller
@SuppressWarnings({ "MagicNumber" })
public class SupplyListControllerSpec {

  private static JavalinJackson javalinJackson = new JavalinJackson();

  private SupplyListController supplylistController;
  private ObjectId samsId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<SupplyList>> supplylistArrayCaptor;

  @Captor
  private ArgumentCaptor<SupplyList> supplylistCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

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

  // Runs before every test. We clear out the supply list collection,
  // insert a small set of sample items, and reset all the mocks.
  // This keeps each test independent so nothing gets messed up by
  // whatever happened in a previous test.
  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> supplylistDocuments = db.getCollection("supplylist");
    supplylistDocuments.drop();
    List<Document> testSupplyList = new ArrayList<>();
    testSupplyList.add(
        new Document()
            .append("school", "MHS")
            .append("grade", "PreK")
            .append("item", "Pencil")
            .append("brand", "Ticonderoga")
            .append("color", "yellow")
            .append("count", 1)
            .append("size", "N/A")
            .append("description", "A standard pencil")
            .append("quantity", 10)
            .append("notes", "N/A")
            .append("type", "#2")
            .append("material", "wood"));
    testSupplyList.add(
        new Document()
            .append("school", "CHS")
            .append("grade", "12th grade")
            .append("item", "Eraser")
            .append("brand", "Pink Pearl")
            .append("color", "pink")
            .append("count", 1)
            .append("size", "Small")
            .append("description", "A standard eraser")
            .append("quantity", 5)
            .append("notes", "N/A")
            .append("type", "rubber")
            .append("material", "rubber"));
    testSupplyList.add(
        new Document()
            .append("school", "MHS")
            .append("grade", "PreK")
            .append("item", "Notebook")
            .append("brand", "Five Star")
            .append("color", "blue")
            .append("count", 1)
            .append("size", "N/A")
            .append("description", "A standard notebook")
            .append("quantity", 3)
            .append("notes", "N/A")
            .append("type", "spiral")
            .append("material", "paper"));

    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("school", "MHS")
        .append("grade", "PreK")
        .append("item", "Backpack")
        .append("brand", "JanSport")
        .append("color", "black")
        .append("count", 1)
        .append("size", "Standard")
        .append("description", "A standard backpack")
        .append("quantity", 2)
        .append("notes", "Plain colors only")
        .append("type", "shoulder bag")
        .append("material", "fabric");

    supplylistDocuments.insertMany(testSupplyList);
    supplylistDocuments.insertOne(sam);

    supplylistController = new SupplyListController(db);
  }

  // Checks that asking for all supply list items returns everything in the
  // database.
  // Also makes sure the controller responds with a 200 OK.
  @Test
  void canGetAllSupplyList() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(
        db.getCollection("supplylist").countDocuments(),
        supplylistArrayCaptor.getValue().size());
  }

  // Looks up a supply list item using a real ID and makes sure the controller
  // returns the correct item and a 200 OK status.
  @Test
  void getListWithExistentId() throws IOException {
    String id = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    supplylistController.getList(ctx);

    verify(ctx).json(supplylistCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Backpack", supplylistCaptor.getValue().item);
    assertEquals(samsId.toHexString(), supplylistCaptor.getValue()._id);
  }

  // If the ID in the URL isn’t even shaped like a real MongoDB ObjectId,
  // the controller should reject it right away. This test checks that.
  @Test
  void getListWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      supplylistController.getList(ctx);
    });

    assertEquals("The requested supply list id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  // The ID format is valid, but nothing in the database matches it.
  // The controller should return a “not found” error instead of pretending it’s
  // fine.
  @Test
  void getListWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      supplylistController.getList(ctx);
    });

    assertEquals("The requested supply list item was not found", exception.getMessage());
  }

  // If someone tries to filter by a quantity that isn’t a number,
  // the controller should reject it instead of ignoring it or crashing.
  @Test
  void getSupplyListsRejectsNonIntegerQuantity() {
    when(ctx.queryParamMap()).thenReturn(Map.of("quantity", List.of("notAnInt")));
    when(ctx.queryParam("quantity")).thenReturn("notAnInt");

    BadRequestResponse ex = assertThrows(BadRequestResponse.class, () -> {
      supplylistController.getSupplyLists(ctx);
    });

    assertEquals("quantity must be an integer.", ex.getMessage());
  }

  // The following few test checks that filtering works even if the user types the
  // value with weird capitalization. The controller should treat “pEnCiL” the
  // same as “pencil” and return the correct matching items.
  @Test
  void canFilterSupplyListByItemCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("item", List.of("pEnCiL")));
    when(ctx.queryParam("item")).thenReturn("pEnCiL");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("Pencil", supplylistArrayCaptor.getValue().get(0).item);
  }

  @Test
  void canFilterSupplyListByBrandCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("brand", List.of("tIcOnDeRoGa")));
    when(ctx.queryParam("brand")).thenReturn("tIcOnDeRoGa");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("Ticonderoga", supplylistArrayCaptor.getValue().get(0).brand);
  }

  @Test
  void canFilterSupplyListByColorCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("color", List.of("yElLoW")));
    when(ctx.queryParam("color")).thenReturn("yElLoW");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("yellow", supplylistArrayCaptor.getValue().get(0).color);
  }

  @Test
  void canFilterSupplyListBySizeCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("size", List.of("sTaNdArD")));
    when(ctx.queryParam("size")).thenReturn("sTaNdArD");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("Standard", supplylistArrayCaptor.getValue().get(0).size);
  }

  @Test
  void canFilterSupplyListByDescriptionCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("description", List.of("A standard backpack")));
    when(ctx.queryParam("description")).thenReturn("A standard backpack");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("A standard backpack", supplylistArrayCaptor.getValue().get(0).description);
  }

  @Test
  void canFilterSupplyListByNotesCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("notes", List.of("Plain colors only")));
    when(ctx.queryParam("notes")).thenReturn("Plain colors only");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("Plain colors only", supplylistArrayCaptor.getValue().get(0).notes);
  }

  @Test
  void canFilterSupplyListByMaterialCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("material", List.of("wood")));
    when(ctx.queryParam("material")).thenReturn("wood");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("wood", supplylistArrayCaptor.getValue().get(0).material);
  }

  @Test
  void canFilterSupplyListByTypeCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("type", List.of("shoulder bag")));
    when(ctx.queryParam("type")).thenReturn("shoulder bag");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, supplylistArrayCaptor.getValue().size());
    assertEquals("shoulder bag", supplylistArrayCaptor.getValue().get(0).type);
  }

  @Test
  void canFilterSupplyListBySchoolCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("school", List.of("MHS")));
    when(ctx.queryParam("school")).thenReturn("MHS");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(3, supplylistArrayCaptor.getValue().size());
    assertEquals("MHS", supplylistArrayCaptor.getValue().get(0).school);
  }

  @Test
  void canFilterSupplyListByGradeCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("grade", List.of("PreK")));
    when(ctx.queryParam("grade")).thenReturn("PreK");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(3, supplylistArrayCaptor.getValue().size());
    assertEquals("PreK", supplylistArrayCaptor.getValue().get(0).grade);
  }

  // The following test checks that multiple tags can be inserted in a filter
  @Test
  void canFilterSupplyListByItemMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("item", List.of("pEnCiL, Notebook")));
    when(ctx.queryParam("item")).thenReturn("pEnCiL, Notebook");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("Pencil", supplylistArrayCaptor.getValue().get(0).item);
    assertEquals("Notebook", supplylistArrayCaptor.getValue().get(1).item);
  }

  @Test
  void canFilterSupplyListByBrandMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("brand", List.of("tIcOnDeRoGa, Pink Pearl")));
    when(ctx.queryParam("brand")).thenReturn("tIcOnDeRoGa, Pink Pearl");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("Ticonderoga", supplylistArrayCaptor.getValue().get(0).brand);
    assertEquals("Pink Pearl", supplylistArrayCaptor.getValue().get(1).brand);
  }

  @Test
  void canFilterSupplyListByColorMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("color", List.of("yElLoW, Blue, Pink")));
    when(ctx.queryParam("color")).thenReturn("yElLoW, Blue, Pink");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(3, supplylistArrayCaptor.getValue().size());
    assertEquals("yellow", supplylistArrayCaptor.getValue().get(0).color);
    assertEquals("pink", supplylistArrayCaptor.getValue().get(1).color);
    assertEquals("blue", supplylistArrayCaptor.getValue().get(2).color);
  }

  @Test
  void canFilterSupplyListBySizeMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("size", List.of("sTaNdArD, Small")));
    when(ctx.queryParam("size")).thenReturn("sTaNdArD, Small");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("Small", supplylistArrayCaptor.getValue().get(0).size);
    assertEquals("Standard", supplylistArrayCaptor.getValue().get(1).size);
  }

  @Test
  void canFilterSupplyListByDescriptionMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("description", List.of("backpack, pencil")));
    when(ctx.queryParam("description")).thenReturn("backpack, pencil");

    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("A standard pencil", supplylistArrayCaptor.getValue().get(0).description);
    assertEquals("A standard backpack", supplylistArrayCaptor.getValue().get(1).description);
  }

  @Test
  void canFilterSupplyListByMaterialMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("material", List.of("wood, paper")));
    when(ctx.queryParam("material")).thenReturn("wood, paper");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("wood", supplylistArrayCaptor.getValue().get(0).material);
    assertEquals("paper", supplylistArrayCaptor.getValue().get(1).material);
  }

  @Test
  void canFilterSupplyListByTypeMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("type", List.of("bag, 2")));
    when(ctx.queryParam("type")).thenReturn("bag, 2");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(2, supplylistArrayCaptor.getValue().size());
    assertEquals("#2", supplylistArrayCaptor.getValue().get(0).type);
    assertEquals("shoulder bag", supplylistArrayCaptor.getValue().get(1).type);
  }

  @Test
  void canFilterSupplyListBySchoolMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("school", List.of("MHS, CHS")));
    when(ctx.queryParam("school")).thenReturn("MHS, CHS");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(4, supplylistArrayCaptor.getValue().size());
    assertEquals("MHS", supplylistArrayCaptor.getValue().get(0).school);
    assertEquals("CHS", supplylistArrayCaptor.getValue().get(1).school);
  }

  @Test
  void canFilterSupplyListByGradeMultipleCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("grade", List.of("PreK, 12th grade")));
    when(ctx.queryParam("grade")).thenReturn("PreK, 12th grade");
    supplylistController.getSupplyLists(ctx);

    verify(ctx).json(supplylistArrayCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(4, supplylistArrayCaptor.getValue().size());
    assertEquals("PreK", supplylistArrayCaptor.getValue().get(0).grade);
    assertEquals("12th grade", supplylistArrayCaptor.getValue().get(1).grade);

  }

  @Test
  void addSupplyItemSuccessfully() {
    String newSupplyList = """
        {
          "school": "MHS",
          "grade": "PreK",
          "item": "Marker",
          "brand": "Crayola",
          "color": "red",
          "count": 1,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": 10,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(newSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            newSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(newSupplyList, SupplyList.class)
          ));

    supplylistController.addSupplyList(ctx);

    verify(ctx).status(HttpStatus.CREATED);
  }

  @Test
  void addSupplyItemWithInvalidQuantity() {
    String invalidSupplyList = """
        {
          "school": "MHS",
          "grade": "PreK",
          "item": "Marker",
          "brand": "Crayola",
          "color": "red",
          "count": 1,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": -5,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(invalidSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            invalidSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(invalidSupplyList, SupplyList.class)
          ));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      supplylistController.addSupplyList(ctx);
    });

    assertTrue(exception.getErrors().get("REQUEST_BODY").get(0).toString().contains("quantity must be a positive integer"));
  }

  @Test
  void addSupplyItemWithInvalidCount() {
    String invalidSupplyList = """
        {
          "school": "MHS",
          "grade": "PreK",
          "item": "Marker",
          "brand": "Crayola",
          "color": "red",
          "count": 0,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": 10,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(invalidSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            invalidSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(invalidSupplyList, SupplyList.class)
          ));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      supplylistController.addSupplyList(ctx);
    });

    assertTrue(exception.getErrors().get("REQUEST_BODY").get(0).toString().contains("count must be a positive integer"));
  }

  @Test
  void addSupplyItemWithMissingItemName() {
    String invalidSupplyList = """
        {
          "school": "MHS",
          "grade": "PreK",
          "brand": "Crayola",
          "color": "red",
          "count": 1,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": 10,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(invalidSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            invalidSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(invalidSupplyList, SupplyList.class)
          ));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      supplylistController.addSupplyList(ctx);
    });

    assertTrue(exception.getErrors().get("REQUEST_BODY").get(0).toString().contains("item must be a non-empty string"));
  }

  @Test
  void addSupplyItemWithMissingSchool() {
    String invalidSupplyList = """
        {
          "grade": "PreK",
          "item": "Marker",
          "brand": "Crayola",
          "color": "red",
          "count": 1,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": 10,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(invalidSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            invalidSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(invalidSupplyList, SupplyList.class)
          ));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      supplylistController.addSupplyList(ctx);
    });

    assertTrue(exception.getErrors().get("REQUEST_BODY").get(0).toString().contains("school must be a non-empty string"));
  }

  @Test
  void addSupplyItemWithMissingGrade() {
    String invalidSupplyList = """
        {
          "school": "MHS",
          "item": "Marker",
          "brand": "Crayola",
          "color": "red",
          "count": 1,
          "size": "N/A",
          "description": "A standard marker",
          "quantity": 10,
          "notes": "N/A",
          "type": "dry erase",
          "material": "plastic"
        }
        """;

    when(ctx.body()).thenReturn(invalidSupplyList);
    when(ctx.bodyValidator(SupplyList.class))
        .thenReturn(new BodyValidator<SupplyList>(
            invalidSupplyList,
            SupplyList.class,
              () -> javalinJackson.fromJsonString(invalidSupplyList, SupplyList.class)
          ));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      supplylistController.addSupplyList(ctx);
    });

    assertTrue(exception.getErrors().get("REQUEST_BODY").get(0).toString().contains("grade must be a non-empty string"));
  }

  @Test
  void deleteSupplyListWithExistentId() throws IOException {
    String id = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    supplylistController.deleteSupplyList(ctx);

    verify(ctx).status(HttpStatus.NO_CONTENT);
  }

  @Test
  void deleteSupplyListWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      supplylistController.deleteSupplyList(ctx);
    });

    assertEquals("The requested supply list id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void deleteSupplyListWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      supplylistController.deleteSupplyList(ctx);
    });

    assertEquals("The requested supply list item was not found", exception.getMessage());
  }

  @Test
  void deleteSupplyListActuallyDeletes() throws IOException {
    String id = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    supplylistController.deleteSupplyList(ctx);

    verify(ctx).status(HttpStatus.NO_CONTENT);

    // Make sure the item is actually gone from the database
    when(ctx.pathParam("id")).thenReturn(id);
    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      supplylistController.getList(ctx);
    });

    assertEquals("The requested supply list item was not found", exception.getMessage());
  }


  // Makes sure the controller actually registers its routes with Javalin.
  // If someone accidentally removes or renames a route, this test will catch it.
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    supplylistController.addRoutes(mockServer);
    verify(mockServer, Mockito.atLeast(1)).get(any(), any());
  }
}
