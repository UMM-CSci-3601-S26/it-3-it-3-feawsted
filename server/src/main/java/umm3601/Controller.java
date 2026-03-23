package umm3601;

import io.javalin.Javalin;

/**
 * Interface for classes that register routes on a Javalin server.
 */
public interface Controller {

  /**
   * Adds this controller's routes to the server.
   *
   * @param server Javalin instance to attach routes to
   */
  void addRoutes(Javalin server);
}
