
export class ChecklistViewPage {
  private readonly baseUrl = '/checklists';
  private readonly pageTitle = '.checklist-view-title';
  private readonly checklistCardSelector = '.checklist-cards-container app-checklist-card';
  private readonly checklistListItemsSelector = '.checklist-nav-list .checklist-view-item';
  //private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  //private readonly radioButtonSelector = '[data-test=viewTypeRadio] mat-radio-button';
  //private readonly checklistRoleDropdownSelector = '[data-test=checklistRoleSelect]';
  private readonly dropdownOptionSelector = 'mat-option';
  private readonly exportPDFButtonSelector = '[data-test=exportPDFButton]';
  private readonly filterInputSelector = '[data-test=checklistFilterInput]';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/checklists` page.
   *
   * @returns the value of the element with the ID `.checklist-list-title`
   */
  getChecklistTitle() {
    return cy.get(this.pageTitle);
  }

  /**
   * Get all the `app-checklist-card` DOM elements. This will be
   * empty if we're using the list view of the checklists.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `app-checklist-card` DOM elements.
   */
  getChecklistCards() {
    return cy.get(this.checklistCardSelector);
  }

  /**
   * Get all the `.checklist-list-item` DOM elements. This will
   * be empty if we're using the card view of the checklists.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `.checklist-list-item` DOM elements.
   */
  getChecklistListItems() {
    return cy.get(this.checklistListItemsSelector);
  }

  getExportPDFButton() {
    return cy.get(this.exportPDFButtonSelector);
  }

  getGenerateChecklistsButton() {
    return cy.get('[data-cy="generate-checklists-button"]');

  }
}
