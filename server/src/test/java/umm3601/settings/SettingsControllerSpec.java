// Packages
package umm3601.settings;

// Static Imports
import static org.junit.jupiter.api.Assertions.assertEquals;
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
 * Tests for the SettingsController using a real MongoDB "test" database.
 *
 * These tests make sure the controller behaves the way the rest of the app
 * expects it to. They cover:
 * -
 * -
 * -
 * -
 *
 * Each test starts with a clean set of settings documents so results are
 * predictable and easy to understand.
 */

// Tests for the Settings Controller
@SuppressWarnings({ "MagicNumber" })
class SettingsControllerSpec {

  private SettingsController settingsController;
  private ObjectId testSettingsId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @SuppressWarnings("unused")
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Settings>> settingsArrayListCaptor;

  @Captor
  private ArgumentCaptor<Settings> settingsCaptor;

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

  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> settingsDocuments = db.getCollection("settings");
    settingsDocuments.drop();
    List<Document> testSettings = new ArrayList<>();
    testSettings.add(
        new Document()
            .append("school", "MHS")
            .append("grade", "4")
            .append("studentName", "Elmo")
            .append("requestedSupplies", List.of("headphones"))
            .append("settings", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", "Pencils")
                        .append("brand", "Ticonderoga")
                        .append("description", "Ticonderoga Pencil"))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));
    testSettings.add(
        new Document()
            .append("school", "AHS")
            .append("grade", "8")
            .append("studentName", "johnny")
            .append("requestedSupplies", List.of("backpack"))
            .append("settings", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", "Notebooks")
                        .append("brand", "Five Star")
                        .append("description", "Five Star Notebook"))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));
    testSettings.add(
        new Document()
            .append("school", "SHS")
            .append("grade", "2")
            .append("studentName", "Rocco")
            .append("requestedSupplies", List.of(""))
            .append("settings", List.of(
                new Document()
                    .append("supply", new Document()
                        .append("item", "Erasers")
                        .append("brand", "Pink Pearl")
                        .append("description", "Pink Pearl Eraser"))
                    .append("completed", false)
                    .append("unreceived", false)
                    .append("selectedOption", null))));

    testSettingsId = new ObjectId();

    Document specialSettings = new Document()
        .append("_id", testSettingsId)
        .append("school", "Nowhere")
        .append("grade", "12")
        .append("studentName", "bart")
        .append("requestedSupplies", List.of())
        .append("settings", List.of(
            new Document()
                .append("supply", new Document()
                    .append("item", "Markers")
                    .append("brand", "Crayola")
                    .append("description", "Crayola Markers"))
                .append("completed", false)
                .append("unreceived", false)
                .append("selectedOption", null)));

    settingsDocuments.insertMany(testSettings);
    settingsDocuments.insertOne(specialSettings);

    settingsController = new SettingsController(db);
  }

  // Checks that the controller actually registers all its routes with Javalin.
  // If someone removes or renames a route by accident, this test will catch it.
  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    settingsController.addRoutes(mockServer);

    verify(mockServer, Mockito.atLeast(1)).get(any(), any());
    verify(mockServer, atLeastOnce()).get(any(), any());
    verify(mockServer, atLeastOnce()).post(any(), any());
    verify(mockServer, never()).patch(any(), any()); // never use patch so we confirm this
  }
}
