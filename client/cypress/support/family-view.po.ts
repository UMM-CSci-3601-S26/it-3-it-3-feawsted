
export class FamilyViewPage {
  private readonly baseUrl = '/families';
  private readonly pageTitle = '.family-view-title';
  private readonly familyCardSelector = '.family-cards-container app-family-card';
  private readonly familyListItemsSelector = '.family-nav-list .family-view-item';
  //private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  //private readonly radioButtonSelector = '[data-test=viewTypeRadio] mat-radio-button';
  //private readonly familyRoleDropdownSelector = '[data-test=familyRoleSelect]';
  private readonly dropdownOptionSelector = 'mat-option';
  private readonly addFamilyButtonSelector = '[data-test=addFamilyButton]';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/families` page.
   *
   * @returns the value of the element with the ID `.family-list-title`
   */
  getFamilyTitle() {
    return cy.get(this.pageTitle);
  }

  /**
   * Get all the `app-family-card` DOM elements. This will be
   * empty if we're using the list view of the families.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `app-family-card` DOM elements.
   */
  getFamilyCards() {
    return cy.get(this.familyCardSelector);
  }

  /**
   * Get all the `.family-list-item` DOM elements. This will
   * be empty if we're using the card view of the families.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `.family-list-item` DOM elements.
   */
  getFamilyListItems() {
    return cy.get(this.familyListItemsSelector);
  }

  addFamilyButton() {
    return cy.get(this.addFamilyButtonSelector);
  }
}
