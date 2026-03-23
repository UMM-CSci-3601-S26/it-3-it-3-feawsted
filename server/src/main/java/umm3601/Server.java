package umm3601;

import java.util.Arrays;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.bson.UuidRepresentation;

import io.javalin.Javalin;
import io.javalin.http.InternalServerErrorResponse;

/**
 * Configures and starts the Javalin server.
 */
public class Server {

  // Port the server listens on.
  private static final int SERVER_PORT = 4567;

  // MongoDB client used by the server.
  private final MongoClient mongoClient;

  // All controllers that register routes.
  private Controller[] controllers;

  /**
   * Creates a Server instance.
   *
   * @param mongoClient  MongoDB client
   * @param controllers  Controllers that define routes
   */
  public Server(MongoClient mongoClient, Controller[] controllers) {
    this.mongoClient = mongoClient;
    // Defensive copy to avoid external modification.
    this.controllers = Arrays.copyOf(controllers, controllers.length);
  }

  /**
   * Creates a MongoDB client for the given address.
   *
   * @param mongoAddr MongoDB host address
   * @return configured MongoClient
   */
  static MongoClient configureDatabase(String mongoAddr) {
    return MongoClients.create(
      MongoClientSettings.builder()
        .applyToClusterSettings(builder ->
          builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
        // Use standard UUID encoding.
        .uuidRepresentation(UuidRepresentation.STANDARD)
        .build()
    );
  }

  /**
   * Starts the Javalin server.
   */
  void startServer() {
    Javalin javalin = configureJavalin();
    setupRoutes(javalin);
    javalin.start(SERVER_PORT);
  }

  /**
   * Creates and configures the Javalin instance.
   *
   * @return configured Javalin server
   */
  private Javalin configureJavalin() {
    Javalin server = Javalin.create(config ->
      config.bundledPlugins.enableRouteOverview("/api")
    );

    configureShutdowns(server);

    // Convert uncaught exceptions to HTTP 500 responses.
    server.exception(Exception.class, (e, ctx) -> {
      throw new InternalServerErrorResponse(e.toString());
    });

    return server;
  }

  /**
   * Registers shutdown hooks for the server and MongoDB client.
   *
   * @param server Javalin instance
   */
  private void configureShutdowns(Javalin server) {
    Runtime.getRuntime().addShutdownHook(new Thread(server::stop));

    server.events(event -> {
      event.serverStartFailed(mongoClient::close);
      event.serverStopped(mongoClient::close);
    });
  }

  /**
   * Registers all controller routes.
   *
   * @param server Javalin instance
   */
  private void setupRoutes(Javalin server) {
    for (Controller controller : controllers) {
      controller.addRoutes(server);
    }
  }
}
