import { AppPage } from '../support/app.po';

// TODO: Update these tests to reflect the actual content of our app.

const page = new AppPage();

describe('App', () => {
  beforeEach(() => page.navigateTo());

  it('Should have the correct title', () => {
    page.getAppTitle().should('contain', 'Ready For Supplies');
  });

  it('The sidenav should open, navigate to "Users" and back to "Home"', () => {
    // Before clicking on the button, the sidenav should be hidden
    page.getSidenav()
      .should('be.hidden');
    page.getSidenavButton()
      .should('be.visible');

    // // Try to navigate to Home
    // page.getSidenavButton().click();
    // page.getNavLink('Home').click();
    // cy.url().should('match', /^https?:\/\/[^/]+\/?$/);
    // page.getSidenav()
    //   .should('be.hidden');
  });

});
