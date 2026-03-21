import { CompanyListPage } from '../support/company-list.po';

const page = new CompanyListPage();

describe('Company list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getUserTitle().should('have.text', 'Companies');
  });

  // There are 10 users in the database, two of which work
  // for OHMNET, so there are 9 different companies.
  it('Should show 9 companies in the list', () => {
    page.getCompanyCards().should('have.length', 9);
  });

  it('Should contain a company with the name "OHMNET"', () => {
    page.getCompanyCardByName('OHMNET').should('exist');
  });

  it('Should contain a company with the name "OHMNET" and 2 users', () => {
    page.getCompanyCardUserNames('OHMNET').should('have.length', 2);
  });

  it('Should contain a company with the name "VINCH" and 1 user', () => {
    page.getCompanyCardUserNames('VINCH').should('have.length', 1);
  });
});
