package umm3601;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;

import umm3601.checklist.ChecklistController;
import umm3601.family.FamilyController;
import umm3601.inventory.InventoryController;
import umm3601.purchaselist.PurchaselistController;
import umm3601.settings.SettingsController;
import umm3601.supplylist.SupplyListController;
import umm3601.terms.TermsController;

public class Main {

  public static void main(String[] args) {
    // Read MongoDB host and DB name, falling back to defaults.
    String mongoAddr = Main.getEnvOrDefault("MONGO_ADDR", "localhost");
    String databaseName = Main.getEnvOrDefault("MONGO_DB", "dev");

    // Create MongoDB client and database reference.
    MongoClient mongoClient = Server.configureDatabase(mongoAddr);
    MongoDatabase database = mongoClient.getDatabase(databaseName);

    // Controllers used by the server.
    final Controller[] controllers = Main.getControllers(database);

    // Start the server.
    Server server = new Server(mongoClient, controllers);
    server.startServer();
  }

  /**
   * Returns an environment variable or a default value.
   */
  static String getEnvOrDefault(String envName, String defaultValue) {
    return System.getenv().getOrDefault(envName, defaultValue);
  }

  /**
   * Returns the controllers used by the server.
   */
  static Controller[] getControllers(MongoDatabase database) {
    Controller[] controllers = new Controller[] {
        // Add controllers here as you create them.
        // e.g., new UserController(database)
        new FamilyController(database),
        new InventoryController(database),
        new SupplyListController(database),
        new ChecklistController(database),
        new SettingsController(database),
        new TermsController(database),
        new PurchaselistController(database)
    };
    return controllers;
  }
}
