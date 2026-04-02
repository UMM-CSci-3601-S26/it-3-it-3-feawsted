/ Packages
package umm3601.checklist;

// Static imports
import static com.mongodb.client.model.Filters.and;

// Org Imports
import org.mongojack.JacksonMongoCollection;
import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

// Com Imports
import com.mongodb.client.model.Filters;
import com.mongodb.client.MongoDatabase;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

// Java Imports
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Misc Imports
import umm3601.Controller;
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.supplylist.SupplyList;

/**
 * Controller for handling Checklist-related API routes.
 *
 * Routes include:
 *  - GET /api/checklist             → list all checklist items (with optional filters)
 *  - GET /api/checklist/{id}         → get a single checklist item
 *
 * Checklist is the core data model for tracking what supplies students, and will be used
 * help calculate supplies demands.
 */

public class ChecklistController implements Controller {

  private static final String API_CHECKLIST = "/api/checklist";
  private static final String API_CHECKLIST_PRINT = "/api/checklist/print";
  private static final String API_CHECKLIST_BY_NAME = "/api/checklist/student/{name}";
  private static final String API_CHECKLIST_FAMILY = "/api/checklist/family/{guardianName}";
  private static final String API_CHECKLIST_BY_ID = "/api/checklist/{id}";
  private static final String API_CHECKLIST_ITEM = "/api/checklist/{id}/item/{index}";

  static final String SCHOOL_KEY = "school";
  static final String GRADE_KEY = "grade";
  static final String NAME_KEY = "studentName";

  private final JacksonMongoCollection<Family> familyCollection;
  private final JacksonMongoCollection<SupplyList> supplyListCollection;
  private final JacksonMongoCollection<Checklist> checklistCollection;

  public ChecklistController(MongoDatabase db) {
    familyCollection = JacksonMongoCollection.builder().build(
      db, "families", Family.class, UuidRepresentation.STANDARD);
    supplyListCollection = JacksonMongoCollection.builder().build(
      db, "supply-list", SupplyList.class, UuidRepresentation.STANDARD);
    checklistCollection = JacksonMongoCollection.builder().build(
      db, "checklists", Checklist.class, UuidRepresentation.STANDARD);
  }

  // Builds a Checklist for a single student from the supply list (not persisted)
  public Checklist createChecklist(StudentInfo student, List<SupplyList> allSupplies) {
    List<Checklist.ChecklistItem> items = allSupplies.stream()
      .filter(s -> s.school != null && s.school.equals(student.school)
        && s.grade != null && s.grade.equals(student.grade))
      .map(Checklist.ChecklistItem::new)
      .collect(Collectors.toList());

    Checklist checklist = new Checklist();
    checklist.studentName = student.name;   //can't display last name, so maybe guardian name instead?
    checklist.school = student.school;
    checklist.grade = student.grade;
    checklist.checklist = items;
    return checklist;
  }

  // --- PRINT ROUTES (on-the-fly, not persisted) ---

  // GET /api/checklist/print — all students
  public void printAllChecklists(Context ctx) {
    List<SupplyList> allSupplies = supplyListCollection.find().into(new ArrayList<>());
    List<Checklist> checklists = familyCollection.find().into(new ArrayList<>()).stream()
      .flatMap(f -> f.students.stream().map(s -> createChecklist(s, allSupplies)))
      .collect(Collectors.toList());
    ctx.json(checklists);
    ctx.status(HttpStatus.OK);
  }

  // GET /api/checklist/student/{name} — single student by full name
  public void printChecklistByStudent(Context ctx) {
    String name = ctx.pathParam("name");
    List<SupplyList> allSupplies = supplyListCollection.find().into(new ArrayList<>());
    for (Family family : familyCollection.find().into(new ArrayList<>())) {
      for (StudentInfo student : family.students) {
        if ((student.name).equalsIgnoreCase(name)) {
          ctx.json(createChecklist(student, allSupplies));
          ctx.status(HttpStatus.OK);
          return;
        }
      }
    }
    throw new NotFoundResponse("No student found with name: " + name);
  }

  // GET /api/checklist/family/{guardianName} — all students in a family
  public void printChecklistsByFamily(Context ctx) {
    String guardianName = ctx.pathParam("guardianName");
    List<SupplyList> allSupplies = supplyListCollection.find().into(new ArrayList<>());
    List<Family> families = familyCollection.find(
      Filters.regex("guardianFirstName", guardianName, "i")).into(new ArrayList<>());
    if (families.isEmpty()) {
      throw new NotFoundResponse("No family found for guardian: " + guardianName);
    }
    List<Checklist> checklists = families.stream()
      .flatMap(f -> f.students.stream().map(s -> createChecklist(s, allSupplies)))
      .collect(Collectors.toList());
    ctx.json(checklists);
    ctx.status(HttpStatus.OK);
  }

  // --- DIGITAL DRIVE-DAY ROUTES (persisted to MongoDB) ---

  // POST /api/checklist — snapshot all families into the checklists collection
  public void generateDigitalChecklists(Context ctx) {
    List<SupplyList> allSupplies = supplyListCollection.find().into(new ArrayList<>());
    List<Checklist> checklists = familyCollection.find().into(new ArrayList<>()).stream()
      .flatMap(f -> f.students.stream().map(s -> createChecklist(s, allSupplies)))
      .collect(Collectors.toList());
    checklistCollection.insertMany(checklists);
    ctx.json(checklists);
    ctx.status(HttpStatus.CREATED);
  }

  // GET /api/checklist — query stored digital checklists (optional ?school= and ?grade= filters)
  public void getStoredChecklists(Context ctx) {
    Bson filter = constructFilter(ctx);
    ctx.json(checklistCollection.find(filter).into(new ArrayList<>()));
    ctx.status(HttpStatus.OK);
  }

  // Constructs a MongoDB filter from optional query params
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
      filters.add(Filters.eq(SCHOOL_KEY, ctx.queryParam(SCHOOL_KEY)));
    }
    if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
      filters.add(Filters.eq(GRADE_KEY, ctx.queryParam(GRADE_KEY)));
    }
    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      filters.add(Filters.regex(NAME_KEY, ctx.queryParam(NAME_KEY), "i"));
    }

    return filters.isEmpty() ? new Document() : and(filters);
  }

  // GET /api/checklist/{id} — get a single stored checklist by id
  public void getStoredChecklistById(Context ctx) {
    String id = ctx.pathParam("id");
    Checklist checklist;
    try {
      checklist = checklistCollection.find(Filters.eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("Invalid checklist ID.");
    }
    if (checklist == null) {
      throw new NotFoundResponse("Checklist not found.");
    }
    ctx.json(checklist);
    ctx.status(HttpStatus.OK);
  }

  // PATCH /api/checklist/{id}/item/{index} — update a single item (completed, unreceived, selectedOption)
  public void updateChecklistItem(Context ctx) {
    String id = ctx.pathParam("id");
    int index;
    try {
      index = Integer.parseInt(ctx.pathParam("index"));
    } catch (NumberFormatException e) {
      throw new BadRequestResponse("Item index must be an integer.");
    }

    Checklist checklist;
    try {
      checklist = checklistCollection.find(Filters.eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("Invalid checklist ID.");
    }
    if (checklist == null) {
      throw new NotFoundResponse("Checklist not found.");
    }
    if (index < 0 || index >= checklist.checklist.size()) {
      throw new BadRequestResponse("Item index out of range.");
    }

    // Parse only the fields present in the request body
    var body = ctx.bodyAsClass(ItemUpdateRequest.class);
    Checklist.ChecklistItem item = checklist.checklist.get(index);
    if (body.completed != null)       item.completed = body.completed;
    if (body.unreceived != null)      item.unreceived = body.unreceived;
    if (body.selectedOption != null)  item.selectedOption = body.selectedOption;

    checklistCollection.save(checklist);
    ctx.json(checklist);
    ctx.status(HttpStatus.OK);
  }

  // Request body for PATCH item update
  public static class ItemUpdateRequest {
    public Boolean completed;
    public Boolean unreceived;
    public String selectedOption;
  }

  @Override
  public void addRoutes(Javalin server) {
    // Print routes (on-the-fly, no persistence)
    server.get(API_CHECKLIST_PRINT,   this::printAllChecklists);
    server.get(API_CHECKLIST_BY_NAME, this::printChecklistByStudent);
    server.get(API_CHECKLIST_FAMILY,  this::printChecklistsByFamily);

    // Digital drive-day routes (persisted)
    server.post(API_CHECKLIST,        this::generateDigitalChecklists);
    server.get(API_CHECKLIST,         this::getStoredChecklists);
    server.get(API_CHECKLIST_BY_ID,   this::getStoredChecklistById);
    server.patch(API_CHECKLIST_ITEM,  this::updateChecklistItem);
  }
}
