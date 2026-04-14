package umm3601.family;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FamilySpec {

  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private Family family1;
  private Family family2;

  @BeforeEach
  void setupEach() {
    family1 = new Family();
    family2 = new Family();

    family1.guardianName = "Sample Guardian";
    family1.altPickUp = "Sample Alternate";
    family1.email = "sample@example.com";
    family1.address = "123 Sample St, Sample City, SC 12345";
  }

  @Test
  void familiesWithEqualIdAreEqual() {
    family1._id = FAKE_ID_STRING_1;
    family2._id = FAKE_ID_STRING_1;

    assertTrue(family1.equals(family2));
  }

  @Test
  void familiesWithDifferentIdAreNotEqual() {
    family1._id = FAKE_ID_STRING_1;
    family2._id = FAKE_ID_STRING_2;

    assertFalse(family1.equals(family2));
  }

  @Test
  void hashCodesAreBasedOnId() {
    family1._id = FAKE_ID_STRING_1;
    family2._id = FAKE_ID_STRING_1;

    assertTrue(family1.hashCode() == family2.hashCode());
  }

  @SuppressWarnings("unlikely-arg-type")
  @Test
  void familiesAreNotEqualToOtherKindsOfThings() {
    family1._id = FAKE_ID_STRING_1;
    // a family is not equal to its id even though id is used for checking equality
    assertFalse(family1.equals(FAKE_ID_STRING_1));
  }

  @Test
  void nullId() {
    family1._id = null;
    family2._id = FAKE_ID_STRING_2;

    assertEquals(family1.hashCode(), 0);
    assertFalse(family1.equals(family2));
  }

  @Test
  void inventoryToString() {
    assertEquals(family1.toString(), "Sample Guardian Sample Alternate sample@example.com 123 Sample St, Sample City, SC 12345");
  }
}
