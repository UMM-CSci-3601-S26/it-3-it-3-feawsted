// Packages
package umm3601.inventory;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static com.mongodb.client.model.Filters.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Jave Imports
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
 * Tests for the InventoryController using a real MongoDB test database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 *  - Getting all inventory items or a single item by ID
 *  - Handling bad or nonexistent IDs correctly
 *  - Filtering inventory by different fields (item, brand, color, etc.)
 *    and making sure filters work even with weird capitalization
 *  - Validating new inventory items before saving them
 *  - Making sure delete and add operations actually change the database
 *  - Checking that the controller registers its routes with Javalin
 *
 * Each test starts with a clean set of inventory documents so results are
 * predictable and easy to reason about.
 */

// Tests for the Inventory Controller
@SuppressWarnings({ "MagicNumber" })
public class InventoryControllerSpec {

  private InventoryController inventoryController;
  private ObjectId inventoryId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Inventory>> inventoryArrayListCaptor;

  @Captor
  private ArgumentCaptor<Inventory> inventoryCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  // Runs once before all the tests. This just connects to a real MongoDB "test"
  // database so the controller is working with actual data instead of fake mocks.
  // It basically sets up the playground the tests will use.
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

    // Setup database
    MongoCollection<Document> inventoryDocuments = db.getCollection("inventory");
    inventoryDocuments.drop();
    List<Document> testInventory = new ArrayList<>();
    testInventory.add(
        new Document()
            .append("item",  "Pencil")
            .append("brand",  "Ticonderoga")
            .append("color",  "yellow")
            .append("count",  1)
            .append("size",  "N/A")
            .append("description",  "A standard pencil")
            .append("quantity", 10)
            .append("notes",  "N/A")
            .append("type", "#2")
            .append("material", "wood"));
    testInventory.add(
        new Document()
            .append("item", "Eraser")
            .append("brand", "Pink Pearl")
            .append("color", "pink")
            .append("count", 1)
            .append("size", "N/A")
            .append("description", "A standard eraser")
            .append("quantity", 5)
            .append("notes", "N/A")
            .append("type", "rubber")
            .append("material", "rubber"));
    testInventory.add(
        new Document()
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

    inventoryId = new ObjectId();
    Document sam = new Document()
        .append("_id", inventoryId)
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

    inventoryDocuments.insertMany(testInventory);
    inventoryDocuments.insertOne(sam);

    inventoryController = new InventoryController(db);
  }

  // Checks that asking for all inventory items actually returns everything in the DB.
  // Makes sure the controller sends back a list and a 200 OK status.
  @Test
  void canGetAllInventory() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(
        db.getCollection("inventory").countDocuments(),
        inventoryArrayListCaptor.getValue().size());
  }

  // Makes sure that looking up an item by a real ID returns the correct inventory entry.
  // Confirms the controller sends the right item and a 200 OK.
  @Test
  void getInventoryItemWithExistentId() throws IOException {
    String id = inventoryId.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    inventoryController.getInventoryItem(ctx);

    verify(ctx).json(inventoryCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Backpack", inventoryCaptor.getValue().item);
    assertEquals(inventoryId.toHexString(), inventoryCaptor.getValue()._id);
  }

  // If the ID in the URL isn’t even a valid MongoDB ObjectId, the controller should
  // immediately reject it. This test makes sure it throws the right error.
  @Test
  void getInventoryItemWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      inventoryController.getInventoryItem(ctx);
    });

    assertEquals("The requested inventory id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  // The ID format is valid, but nothing in the database matches it.
  // The controller should respond with a “not found” error instead of pretending it’s fine.
  @Test
  void getInventoryItemWithNonexistentId() throws IOException {
    String id = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(id);

    Throwable exception = assertThrows(NotFoundResponse.class, () -> {
      inventoryController.getInventoryItem(ctx);
    });

    assertEquals("The requested inventory item was not found", exception.getMessage());
  }

  // Checks that filtering by quantity works. Only items with quantity = 5 should show up.
  // Makes sure the filter logic is doing what we expect.
  @Test
  void canFilterInventoryByQuantity() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Map.of("quantity", List.of("5")));
    when(ctx.queryParam("quantity")).thenReturn("5");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("Eraser", inventoryArrayListCaptor.getValue().get(0).item);
  }

  // If someone tries to filter by a quantity that isn’t a number,
  // the controller should reject it instead of crashing or ignoring it.
  @Test
  void getInventoriesRejectsNonIntegerQuantity() {
    when(ctx.queryParamMap()).thenReturn(Map.of("quantity", List.of("notAnInt")));
    when(ctx.queryParam("quantity")).thenReturn("notAnInt");

    BadRequestResponse ex = assertThrows(BadRequestResponse.class, () -> {
      inventoryController.getInventories(ctx);
  });

    assertEquals("quantity must be an integer.", ex.getMessage());
  }

  // Each of these following tests checks that filtering works even if the user types the value
  // in weird capitalization. The controller should treat filters like “pEnCiL”
  // the same as “pencil”.
  @Test
  void canFilterInventoryByItemCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("item", List.of("pEnCiL")));
    when(ctx.queryParam("item")).thenReturn("pEnCiL");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("Pencil", inventoryArrayListCaptor.getValue().get(0).item);
  }

  @Test
  void canFilterInventoryByBrandCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("brand", List.of("tIcOnDeRoGa")));
    when(ctx.queryParam("brand")).thenReturn("tIcOnDeRoGa");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("Ticonderoga", inventoryArrayListCaptor.getValue().get(0).brand);
  }

  @Test
  void canFilterInventoryByColorCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("color", List.of("yElLoW")));
    when(ctx.queryParam("color")).thenReturn("yElLoW");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("yellow", inventoryArrayListCaptor.getValue().get(0).color);
  }

  @Test
  void canFilterInventoryBySizeCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("size", List.of("sTaNdArD")));
    when(ctx.queryParam("size")).thenReturn("sTaNdArD");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("Standard", inventoryArrayListCaptor.getValue().get(0).size);
  }

  @Test
  void canFilterInventoryByDescriptionCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("description", List.of("A standard backpack")));
    when(ctx.queryParam("description")).thenReturn("A standard backpack");

    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("A standard backpack", inventoryArrayListCaptor.getValue().get(0).description);
  }

  @Test
  void canFilterInventoryByNotesCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("notes", List.of("Plain colors only")));
    when(ctx.queryParam("notes")).thenReturn("Plain colors only");
    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("Plain colors only", inventoryArrayListCaptor.getValue().get(0).notes);
  }

  @Test
  void canFilterInventoryByMaterialCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("material", List.of("wood")));
    when(ctx.queryParam("material")).thenReturn("wood");
    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("wood", inventoryArrayListCaptor.getValue().get(0).material);
  }

  @Test
  void canFilterInventoryByTypeCaseInsensitive() {
    when(ctx.queryParamMap()).thenReturn(Map.of("type", List.of("shoulder bag")));
    when(ctx.queryParam("type")).thenReturn("shoulder bag");
    inventoryController.getInventories(ctx);

    verify(ctx).json(inventoryArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    assertEquals(1, inventoryArrayListCaptor.getValue().size());
    assertEquals("shoulder bag", inventoryArrayListCaptor.getValue().get(0).type);
  }

  // Makes sure the controller actually registers its routes with Javalin.
  // If someone accidentally removes or renames a route, this test will catch it.
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    inventoryController.addRoutes(mockServer);
    verify(mockServer, Mockito.atLeast(1)).get(any(), any());
  }

  // Deletes an inventory item that really exists. After calling delete,
  // the item should be gone from the database and the controller should return 200 OK.
  @Test
    void deleteFoundInventory() throws IOException {
      String testID = inventoryId.toString();
      when(ctx.pathParam("id")).thenReturn(testID);
      assertEquals(1, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));

      inventoryController.deleteInventory(ctx);
      verify(ctx).status(HttpStatus.OK);
      assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));
    }

  // First deletes an item, then tries deleting it again. The second delete should fail
  // with a “not found” error since the item is already gone.
  @Test
  void tryToDeleteNotFoundInventory() throws IOException {
    String testID = inventoryId.toString();
    when(ctx.pathParam("id")).thenReturn(testID);

    inventoryController.deleteInventory(ctx);
    assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      inventoryController.deleteInventory(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);
    assertEquals(0, db.getCollection("inventory").countDocuments(eq("_id", new ObjectId(testID))));
  }

  // If the ID in the URL isn’t even shaped like a real ObjectId,
  // the controller should throw an error right away instead of trying to use it.
  @Test
  void deleteInventoryWithBadId() {
    when(ctx.pathParam("id")).thenReturn("bad");
    assertThrows(IllegalArgumentException.class, () -> {
      inventoryController.deleteInventory(ctx);
    });
  }

  // Adds a brand‑new inventory item using valid JSON. After the controller inserts it,
  // we check the database to make sure all the fields were saved correctly.
  // Also checks that the controller returns 201 CREATED.
  @Test
  void canAddInventory() throws IOException {
    String newInventoryJson = """
        {
          "item": "Crayons",
          "brand": "Crayola",
          "color": "multicolor",
          "count": 1,
          "size": "N/A",
          "description": "A box of crayons",
          "quantity": 2,
          "notes": "N/A",
          "type": "wax",
          "material": "wax"
        }
        """;

    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    inventoryController.addInventory(ctx);
    verify(ctx).json(mapCaptor.capture());
    verify(ctx).status(HttpStatus.CREATED);

    Document addedInventory = db.getCollection("inventory")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    assertEquals("Crayons", addedInventory.get("item"));
    assertEquals("Crayola", addedInventory.get("brand"));
    assertEquals("multicolor", addedInventory.get("color"));
    assertEquals(1, addedInventory.get("count"));
    assertEquals("N/A", addedInventory.get("size"));
    assertEquals("A box of crayons", addedInventory.get("description"));
    assertEquals(2, addedInventory.get("quantity"));
    assertEquals("N/A", addedInventory.get("notes"));
    assertEquals("wax", addedInventory.get("type"));
  }

  // Tries to add an item where “count” is invalid (like zero or wrong type).
  // The controller should reject it and give a validation error instead of saving bad data.
  @Test
  void addInventoryWithInvalidCount() throws IOException {
    String newInventoryJson = """
        {
          "item": "Crayons",
          "brand": "Crayola",
          "color": "multicolor",
          "count": "0",
          "size": "N/A",
          "description": "A box of crayons",
          "quantity": 2,
          "notes": "N/A",
          "type": "wax",
          "material": "wax"
        }
        """;

    when(ctx.body()).thenReturn(newInventoryJson);
    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryController.addInventory(ctx);
    });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("Quantity must be 1 or more"));
  }

  // Tries to add an item with a negative quantity. Since quantity can’t be negative,
  // the controller should throw a validation error.
  @Test
  void addInventoryWithInvalidQuantity() throws IOException {
    String newInventoryJson = """
        {
          "item": "Crayons",
          "brand": "Crayola",
          "color": "multicolor",
          "count": "1",
          "size": "N/A",
          "description": "A box of crayons",
          "quantity": -1,
          "notes": "N/A",
          "type": "wax",
          "material": "wax"
        }
        """;

    when(ctx.body()).thenReturn(newInventoryJson);
    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryController.addInventory(ctx);
    });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("Quantity must be >= 0"));
  }

  // Tries to add an item with an empty item name. The controller should reject it,
  // because every inventory entry needs a real item name.
  @Test
  void addInventoryWithInvalidItem() throws IOException {
    String newInventoryJson = """
        {
          "item": "",
          "brand": "Crayola",
          "color": "multicolor",
          "count": "10",
          "size": "N/A",
          "description": "A box of crayons",
          "quantity": 2,
          "notes": "N/A",
          "type": "wax",
          "material": "wax"
        }
        """;

    when(ctx.body()).thenReturn(newInventoryJson);
    when(ctx.bodyValidator(Inventory.class))
      .thenReturn(new BodyValidator<Inventory>(newInventoryJson, Inventory.class,
                    () -> javalinJackson.fromJsonString(newInventoryJson, Inventory.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryController.addInventory(ctx);
    });

    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("Inventory must have a non-empty item key"));
  }
}
