//Packages
package umm3601.purchaselist;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Java Imports
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Org Imports
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
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
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.json.JavalinJackson;
import umm3601.inventory.Inventory;
import umm3601.supplylist.SupplyList;
import umm3601.checklist.Checklist;

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

  private static MongoClient mongoClient;
  private static MongoDatabase db;
  private MongoCollection<Inventory> inventoryCollection;
  private MongoCollection<Checklist> checklistCollection;
  private PurchaselistController purchaselistController;

  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Mock
  private JacksonMongoCollection<Checklist> mockChecklistCollection;

  @Mock
  private JacksonMongoCollection<Inventory> mockInventoryCollection;

  @Mock
  private FindIterable<Checklist> mockChecklistFind;

  @Mock
  private FindIterable<Inventory> mockInventoryFind;

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

  @BeforeEach
  void setupEach() {
    MockitoAnnotations.openMocks(this);

    purchaselistController = new PurchaselistController(
        mockChecklistCollection,
        mockInventoryCollection);

    // Mock find() behavior
    when(mockChecklistCollection.find()).thenReturn(mockChecklistFind);
    when(mockInventoryCollection.find()).thenReturn(mockInventoryFind);

    Inventory backpackInventory = new Inventory();
    // backpackInventory._id = new ObjectId("testID");
    backpackInventory.item = "Backpack";
    backpackInventory.quantity = 2;

    Inventory binderInventory = new Inventory();
    // binderInventory._id = new ObjectId("testID2");
    binderInventory.item = "Binder";
    binderInventory.quantity = 5;

    Checklist checklist = new Checklist();
    checklist.checklist = new ArrayList<>();

    Checklist.ChecklistItem item1 = new Checklist.ChecklistItem();
    item1.supply = new SupplyList();
    item1.supply.item = List.of("backpack");
    item1.supply.quantity = 1;

    Checklist.ChecklistItem item2 = new Checklist.ChecklistItem();
    item2.supply = new SupplyList();
    item2.supply.item = List.of("binder");
    item2.supply.quantity = 1;

    checklist.checklist.add(item1);
    checklist.checklist.add(item2);

    when(mockChecklistFind.into(any()))
        .thenAnswer(invocation -> {
          List<Checklist> list = invocation.getArgument(0);
          list.add(checklist);
          return list;
        });

    when(mockInventoryFind.into(any()))
        .thenAnswer(invocation -> {
          List<Inventory> list = invocation.getArgument(0);
          list.add(backpackInventory);
          list.add(binderInventory);
          return list;
        });
  }

  @Test
  void shouldBuildPurchaselistCorrectly() {
    purchaselistController.getPurchaselist(ctx);

    verify(ctx).status(HttpStatus.OK);
    verify(ctx).json(any());

    ArgumentCaptor<List<Purchaselist>> captor = ArgumentCaptor.forClass(List.class);

    verify(ctx).json(captor.capture());

    List<Purchaselist> result = captor.getValue();

    assertTrue(result.size() > 0);

    Purchaselist backpack = result.stream()
        .filter(p -> p.item.equals("backpack"))
        .findFirst()
        .orElse(null);

    assertEquals(1, backpack.needQuantity);
    assertEquals(2, backpack.inventoryQuantity);
    assertEquals(0, backpack.purchaseQuantity);
  }
}
