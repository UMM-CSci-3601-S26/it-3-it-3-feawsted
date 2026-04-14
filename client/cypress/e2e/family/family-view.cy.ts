import { FamilyViewPage } from '../../support/family-view.po';

const page = new FamilyViewPage();

describe('Family view', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getFamilyTitle().should('have.text', 'Families');
  });

  // it('Should show 3 families in card view', () => {
  //   page.getFamilyCards().should('have.length', 3);
  // });

  it('Should click add family and go to the right URL', () => {
    // Click on the button for adding a new family
    page.addFamilyButton().click();

    // The URL should end with '/families/new'
    cy.url().should(url => expect(url.endsWith('/families/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-family-title').should('have.text', 'New Family');
  });

});
