//Packages
package umm3601.checklist;

// Static imports
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

// Org Imports
import org.mongojack.JacksonMongoCollection;
import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

// Com Imports
// import com.mongodb.client.model.Filters;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;

// IO Imports
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;

// Java Imports
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

// Misc Imports
import umm3601.Controller;
import umm3601.checklist.Checklist.ChecklistItem;
import umm3601.family.Family;
import umm3601.family.Family.StudentInfo;
import umm3601.settings.Settings;
import umm3601.settings.SettingsController;
import umm3601.supplylist.SupplyList;

// Define the Checklist class if it doesn't exist elsewhere

/**
 * Controller for handling Checklist-related API routes.
 *
 * Routes include:
 * - GET /api/checklist → list all checklist items (with optional filters)
 * - GET /api/checklist/{id} → get a single checklist item
 *
 * Checklist is the core data model for tracking what supplies students, and
 * will be used
 * help calculate supplies demands.
 */

public class ChecklistController implements Controller {

  private static final String API_CHECKLIST = "/api/checklists";
  // private static final String API_CHECKLIST_PRINT = "/api/checklists/print";
  // private static final String API_CHECKLIST_BY_NAME = "/api/checklists/student/{name}";
  // private static final String API_CHECKLIST_FAMILY = "/api/checklists/family/{guardianName}";
  private static final String API_CHECKLIST_BY_ID = "/api/checklists/{id}";
  // private static final String API_CHECKLIST_ITEM = "/api/checklists/{id}/item/{index}";

  static final String SCHOOL_KEY = "school";
  static final String GRADE_KEY = "grade";
  static final String NAME_KEY = "studentName";
  static final String GUARDIAN_NAME_KEY = "guardianName";
  static final String ALT_PICKUP_KEY = "altPickup";
  static final String REQUESTED_SUPPLIES_KEY = "requestedSupplies";

  private final JacksonMongoCollection<Family> familyCollection;
  private final JacksonMongoCollection<SupplyList> supplyListCollection;
  private final JacksonMongoCollection<Checklist> checklistCollection;
  private final JacksonMongoCollection<Settings> settingsCollection;

  // constructor used for testing:
  public ChecklistController(JacksonMongoCollection<Family> familyCollection,
      JacksonMongoCollection<SupplyList> supplyListCollection,
      JacksonMongoCollection<Checklist> checklistCollection) {
    this.familyCollection = familyCollection;
    this.supplyListCollection = supplyListCollection;
    this.checklistCollection = checklistCollection;
    this.settingsCollection = null;
  }

  // constructor used in server:
  public ChecklistController(MongoDatabase db) {
    familyCollection = JacksonMongoCollection.builder().build(
        db, "families", Family.class, UuidRepresentation.STANDARD);
    supplyListCollection = JacksonMongoCollection.builder().build(
      db, "supplylist", SupplyList.class, UuidRepresentation.STANDARD);
    checklistCollection = JacksonMongoCollection.builder().build(
        db, "checklists", Checklist.class, UuidRepresentation.STANDARD);
    settingsCollection = JacksonMongoCollection.builder().build(
        db, "settings", Settings.class, UuidRepresentation.STANDARD);
  }

  // Normalizes a school name for matching: lowercase, strip trailing " school"
  static String normalizeSchool(String s) {
    if (s == null) {
      return "";
    }
    return s.trim().toLowerCase().replaceAll("\\s+school$", "");
  }

  // Normalizes a grade for matching: lowercase, remove hyphens and spaces
  static String normalizeGrade(String g) {
    if (g == null) {
      return "";
    }
    return g.trim().toLowerCase().replaceAll("[\\s\\-]", "");
  }

  // Grades considered "high school" for expansion purposes
  static final String[] HS_GRADES = {"9", "10", "11", "12"};

  /**
   * Expands any supply list entry whose grade normalizes to "highschool" into
   * individual copies — one per HS grade (9–12) — but only for grades that do
   * not already have a specific entry at the same school.  The original
   * "High School" entry is consumed (not kept) once expanded.
   *
   * This lets operators enter a single "High School" row that automatically
   * covers whichever HS grades a school lacks explicit entries for, without
   * needing to know where each district's high school starts.
   */
  static List<SupplyList> expandHighSchoolSupplies(List<SupplyList> supplies) {
    // Collect (normalizedSchool|normalizedGrade) keys that already have specific entries
    Set<String> existingKeys = new HashSet<>();
    for (SupplyList s : supplies) {
      if (s.school != null && s.grade != null
          && !normalizeGrade(s.grade).equals("highschool")) {
        existingKeys.add(normalizeSchool(s.school) + "|" + normalizeGrade(s.grade));
      }
    }

    List<SupplyList> result = new ArrayList<>();
    for (SupplyList s : supplies) {
      if (s.school != null && s.grade != null
          && normalizeGrade(s.grade).equals("highschool")) {
        // Replace this entry with grade-specific copies for each missing HS grade
        for (String grade : HS_GRADES) {
          String key = normalizeSchool(s.school) + "|" + normalizeGrade(grade);
          if (!existingKeys.contains(key)) {
            result.add(copyWithGrade(s, grade));
          }
        }
      } else {
        result.add(s);
      }
    }
    return result;
  }

  // Shallow-copies a SupplyList, replacing only the grade field.
  // _id is intentionally omitted — the copies are transient (in-memory only).
  static SupplyList copyWithGrade(SupplyList source, String newGrade) {
    SupplyList copy = new SupplyList();
    copy.district = source.district;
    copy.school = source.school;
    copy.grade = newGrade;
    copy.teacher = source.teacher;
    copy.academicYear = source.academicYear;
    copy.item = source.item;
    copy.brand = source.brand;
    copy.size = source.size;
    copy.color = source.color;
    copy.type = source.type;
    copy.style = source.style;
    copy.material = source.material;
    copy.count = source.count;
    copy.quantity = source.quantity;
    copy.notes = source.notes;
    return copy;
  }

  // Builds a Checklist for a single student from the supply list (not persisted)
  public Checklist createChecklist(
    StudentInfo student, String guardianName, String altPickUp, List<SupplyList> allSupplies
  ) {
    String studentSchool = normalizeSchool(student.school);
    String studentGrade = normalizeGrade(student.grade);
    List<Checklist.ChecklistItem> items = allSupplies.stream()
        .filter(s -> s.school != null && s.grade != null
            && normalizeSchool(s.school).equals(studentSchool)
            && normalizeGrade(s.grade).equals(studentGrade))
        .map(Checklist.ChecklistItem::new)
        .collect(Collectors.toList());

    Checklist checklist = new Checklist();
    checklist.studentName = student.name; // can't display last name, so maybe guardian name instead?
    checklist.guardianName = guardianName;
    checklist.altPickUp = altPickUp;
    checklist.school = student.school;
    checklist.grade = student.grade;
    checklist.requestedSupplies = student.requestedSupplies;
    checklist.checklist = items;
    return checklist;
  }

  // --- PRINT ROUTES (on-the-fly, not persisted) ---
  public void exportChecklistsPdf(Context ctx) {
    // Fetch your checklist data
    List<SupplyList> pdfSupplies = expandHighSchoolSupplies(
        supplyListCollection.find().into(new ArrayList<>()));
    List<Checklist> checklists = familyCollection.find()
        .into(new ArrayList<>())
        .stream()
        .flatMap((Family f) ->
          f.students.stream()
            .map((StudentInfo s) ->
              createChecklist(s, f.guardianName, f.altPickUp,  pdfSupplies)))
        .collect(Collectors.toList());

    // Build PDF content manually
    StringBuilder pdf = new StringBuilder();
    pdf.append("%PDF-1.4\n");

    // PDF objects
    pdf.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
    pdf.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");

    // Build the text content
    StringBuilder text = new StringBuilder();
    text.append("BT /F1 12 Tf 50 750 Td\n");

    for (Checklist c : checklists) {
        text.append("(")
            .append("Student: ").append(c.studentName)
            .append(") Tj T* ");

        text.append("(")
            .append("Guardian: ").append(c.guardianName)
            .append(" | Alt Pickup: ").append(c.altPickUp)
            .append(") Tj T* ");

        text.append("(")
            .append(c.school)
            .append(", Grade ").append(c.grade)
            .append(") Tj T* ");

        for (ChecklistItem item : c.checklist) {
            text.append("(")
                .append(" - ").append(item.supply)
                .append(" | completed: ").append(item.completed)
                .append(" | unreceived: ").append(item.unreceived)
                .append(" | option: ").append(item.selectedOption)
                .append(") Tj T* ");
        }

        text.append("() Tj T* "); // blank line
    }

    text.append("ET");

    // PDF page object
    pdf.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]")
       .append(" /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n");

    // PDF content stream
    byte[] textBytes = text.toString().getBytes();
    pdf.append("4 0 obj << /Length ").append(textBytes.length).append(" >> stream\n");
    pdf.append(text.toString()).append("\nendstream endobj\n");

    // Font object
    pdf.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");

    // Trailer
    pdf.append("xref\n0 6\n0000000000 65535 f \n");
    pdf.append("trailer << /Size 6 /Root 1 0 R >>\nstartxref\n");
    pdf.append(pdf.length()).append("\n%%EOF");

    byte[] pdfBytes = pdf.toString().getBytes();

    ctx.contentType("application/pdf");
    ctx.header("Content-Disposition", "inline; filename=checklists.pdf");
    ctx.result(pdfBytes);
  }

  public void printChecklistByStudentPdf(Context ctx) {
      String name = ctx.pathParam("name");

      // Expand supplies (same as your all-PDF version)
      List<SupplyList> pdfSupplies = expandHighSchoolSupplies(
          supplyListCollection.find().into(new ArrayList<>())
      );

      // Find the student and build ONE checklist
      Checklist checklist = null;

      for (Family family : familyCollection.find().into(new ArrayList<>())) {
          for (StudentInfo student : family.students) {
              if (student.name.equalsIgnoreCase(name)) {
                  checklist = createChecklist(student, family.guardianName, family.altPickUp, pdfSupplies);
                  break;
              }
          }
          if (checklist != null) {
            break;
          }
      }

      if (checklist == null) {
          throw new NotFoundResponse("No student found with name: " + name);
      }

      // Build PDF
      StringBuilder pdf = new StringBuilder();
      pdf.append("%PDF-1.4\n");

      pdf.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
      pdf.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");

      StringBuilder text = new StringBuilder();
      text.append("BT /F1 12 Tf 50 750 Td\n");

      // Header
      text.append("(")
          .append("Student: ").append(checklist.studentName)
          .append(") Tj T* ");

      text.append("(")
          .append("Guardian: ").append(checklist.guardianName)
          .append(" | Alt Pickup: ").append(checklist.altPickUp)
          .append(") Tj T* ");

      text.append("(")
          .append(checklist.school)
          .append(", Grade ").append(checklist.grade)
          .append(") Tj T* ");

      // Items
      for (ChecklistItem item : checklist.checklist) {
          text.append("(")
              .append(" - ").append(item.supply)
              .append(" | completed: ").append(item.completed)
              .append(" | unreceived: ").append(item.unreceived)
              .append(" | option: ").append(item.selectedOption)
              .append(") Tj T* ");
      }

      text.append("ET\n");

      // Page object
      pdf.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]")
        .append(" /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n");

      // Content stream
      byte[] textBytes = text.toString().getBytes();
      pdf.append("4 0 obj << /Length ").append(textBytes.length).append(" >> stream\n");
      pdf.append(text.toString()).append("\nendstream endobj\n");

      // Font
      pdf.append("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");

      // Trailer
      pdf.append("xref\n0 6\n0000000000 65535 f \n");
      pdf.append("trailer << /Size 6 /Root 1 0 R >>\nstartxref\n");
      pdf.append(pdf.length()).append("\n%%EOF");

      byte[] pdfBytes = pdf.toString().getBytes();

      ctx.contentType("application/pdf");
      ctx.header("Content-Disposition", "inline; filename=checklist.pdf");
      ctx.result(pdfBytes);
  }


  // GET /api/checklist/family/{guardianName} — all students in a family
  // public void printChecklistsByFamily(Context ctx) {
  //   String guardianName = ctx.pathParam("guardianName");
  //   List<SupplyList> allSupplies = supplyListCollection.find().into(new ArrayList<>());
  //   List<Family> families = familyCollection.find(
  //       Filters.regex("guardianFirstName", guardianName, "i")).into(new ArrayList<>());
  //   if (families.isEmpty()) {
  //     throw new NotFoundResponse("No family found for guardian: " + guardianName);
  //   }
  //   List<Checklist> checklists = families.stream()
  //       .flatMap(f -> f.students.stream().map(s -> createChecklist(s, allSupplies)))
  //       .collect(Collectors.toList());
  //   ctx.json(checklists);
  //   ctx.status(HttpStatus.OK);
  // }

  // POST /api/checklist — snapshot all families into the checklists collection
  public void generateDigitalChecklists(Context ctx) {
    checklistCollection.deleteMany(new Document());
    List<SupplyList> rawSupplies = supplyListCollection.find().into(new ArrayList<>());

    // Apply the operator-configured drive order from settings
    List<SupplyList> orderedSupplies = rawSupplies;
    if (settingsCollection != null) {
      Settings settings = settingsCollection.find(eq("_id", SettingsController.SETTINGS_ID)).first();
      if (settings != null && settings.supplyOrder != null && !settings.supplyOrder.isEmpty()) {
        orderedSupplies = applySupplyOrder(rawSupplies, settings.supplyOrder);
      }
    }

    final List<SupplyList> allSupplies = expandHighSchoolSupplies(orderedSupplies);
    List<Checklist> checklists = familyCollection.find().into(new ArrayList<>()).stream()
        .flatMap((Family f) ->
          f.students.stream()
            .map((StudentInfo s) -> createChecklist(s, f.guardianName, f.altPickUp, rawSupplies)))
        .collect(Collectors.toList());
    checklistCollection.insertMany(checklists);
    ctx.json(checklists);
    ctx.status(HttpStatus.CREATED);
  }

  /**
   * Orders and filters the supply list according to the saved drive-day order.
   * - "staged"   items come first, in their saved order
   * - "unstaged" items come after all staged items (original fetch order preserved)
   * - "notGiven" items are excluded entirely
   */
  static List<SupplyList> applySupplyOrder(List<SupplyList> supplies,
      List<Settings.SupplyItemOrder> supplyOrder) {
    // Build a map of itemTerm -> staged position
    Map<String, Integer> stagedIndex = new HashMap<>();
    Set<String> notGivenTerms = new HashSet<>();
    // Set the index of staged items to their position in the supplyOrder list; unstaged items will default to MAX_VALUE
    int pos = 0;
    // Iterate in order and record the index of each staged term, and collect notGiven terms
    for (Settings.SupplyItemOrder entry : supplyOrder) {
      if ("staged".equals(entry.status)) {
        stagedIndex.put(entry.itemTerm, pos++);
      } else if ("notGiven".equals(entry.status)) {
        notGivenTerms.add(entry.itemTerm);
      }
    }

    // Exclude supplies whose item list contains any notGiven term.
    // Sort remaining: staged supplies (by lowest matching term index) before unstaged.
    return supplies.stream()
        // Exclude supplies that have any notGiven terms in their item list; if item is null,
        // keep it (could be a non-standard supply that doesn't match any terms)
        .filter(s -> s.item == null || s.item.stream().noneMatch(notGivenTerms::contains))
        // Supplies with a staged term get their lowest index; unstaged supplies default to MAX_VALUE, so come last
        .sorted(Comparator.comparingInt(s -> {
          if (s.item == null) {
            return Integer.MAX_VALUE;
          }
          return s.item.stream()
              .mapToInt(t -> stagedIndex.getOrDefault(t, Integer.MAX_VALUE))
              .min()
              .orElse(Integer.MAX_VALUE);
        }))
        .collect(Collectors.toList());
  }

  // GET /api/checklist — query stored digital checklists (optional ?school= and
  // ?grade= filters)
  public void getStoredChecklists(Context ctx) {
    Bson filter = constructFilter(ctx);
    ctx.json(checklistCollection.find(filter).into(new ArrayList<>()));
    ctx.status(HttpStatus.OK);
  }

  // Constructs a MongoDB filter from optional query params
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(SCHOOL_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(SCHOOL_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(SCHOOL_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey(GRADE_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(GRADE_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(GRADE_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(NAME_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(NAME_KEY, pattern));
    }

    return filters.isEmpty() ? new Document() : and(filters);
  }

  // // GET /api/checklist/{id} — get a single stored checklist by id
  public void getStoredChecklistById(Context ctx) {
    String id = ctx.pathParam("id");
     System.out.println("Looking for checklist ID: " + id);

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

  // // PATCH /api/checklist/{id}/item/{index} — update a single item (completed,
  // // unreceived, selectedOption)
  // public void updateChecklistItem(Context ctx) {
  //   String id = ctx.pathParam("id");
  //   int index;
  //   try {
  //     index = Integer.parseInt(ctx.pathParam("index"));
  //   } catch (NumberFormatException e) {
  //     throw new BadRequestResponse("Item index must be an integer.");
  //   }
  //   Checklist checklist;
  //   try {
  //     checklist = checklistCollection.find(Filters.eq("_id", new ObjectId(id))).first();
  //   } catch (IllegalArgumentException e) {
  //     throw new BadRequestResponse("Invalid checklist ID.");
  //   }
  //   if (checklist == null) {
  //     throw new NotFoundResponse("Checklist not found.");
  //   }
  //   if (index < 0 || index >= checklist.checklist.size()) {
  //     throw new BadRequestResponse("Item index out of range.");
  //   }
  //   // Parse only the fields present in the request body
  //   var body = ctx.bodyAsClass(ItemUpdateRequest.class);
  //   Checklist.ChecklistItem item = checklist.checklist.get(index);
  //   if (body.completed != null)
  //     item.completed = body.completed;
  //   if (body.unreceived != null)
  //     item.unreceived = body.unreceived;
  //   if (body.selectedOption != null)
  //     item.selectedOption = body.selectedOption;
  //   checklistCollection.save(checklist);
  //   ctx.json(checklist);
  //   ctx.status(HttpStatus.OK);
  // }
  // // Request body for PATCH item update
  // public static class ItemUpdateRequest {
  //   public Boolean completed;
  //   public Boolean unreceived;
  //   public String selectedOption;
  // }

  @Override
  public void addRoutes(Javalin server) {
    // Print routes (on-the-fly, no persistence)
    // server.get(API_CHECKLIST_PRINT, this::printAllChecklists);
    // server.get(API_CHECKLIST_BY_NAME, this::printChecklistByStudent);
    // server.get(API_CHECKLIST_FAMILY, this::printChecklistsByFamily);

    // Digital drive-day routes (persisted)
    server.post(API_CHECKLIST, this::generateDigitalChecklists);
    server.get(API_CHECKLIST, this::getStoredChecklists);
    server.get("/checklists/export/pdf", this::exportChecklistsPdf);

    server.get(API_CHECKLIST_BY_ID, this::getStoredChecklistById);
    // server.patch(API_CHECKLIST_ITEM, this::updateChecklistItem);
  }
}
