package umm3601.user;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserSpec {

  private static final String FAKE_ID_STRING_1 = "fakeIdOne";
  private static final String FAKE_ID_STRING_2 = "fakeIdTwo";

  private User user1;
  private User user2;

  @BeforeEach
  void setupEach() {
    user1 = new User();
    user2 = new User();
  }

  @Test
  void usersWithEqualIdAreEqual() {
    user1._id = FAKE_ID_STRING_1;
    user2._id = FAKE_ID_STRING_1;

    assertTrue(user1.equals(user2));
  }

  @Test
  void usersWithDifferentIdAreNotEqual() {
    user1._id = FAKE_ID_STRING_1;
    user2._id = FAKE_ID_STRING_2;

    assertFalse(user1.equals(user2));
  }

  @Test
  void hashCodesAreBasedOnId() {
    user1._id = FAKE_ID_STRING_1;
    user2._id = FAKE_ID_STRING_1;

    assertTrue(user1.hashCode() == user2.hashCode());
  }

  @SuppressWarnings("unlikely-arg-type")
  @Test
  void usersAreNotEqualToOtherKindsOfThings() {
    user1._id = FAKE_ID_STRING_1;
    // a user is not equal to its id even though id is used for checking equality
    assertFalse(user1.equals(FAKE_ID_STRING_1));
  }
}
