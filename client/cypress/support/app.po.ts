export class AppPage {

  // TODO: Update these selectors to reflect the actual content of our app.

  private readonly baseUrl = '/';
  private readonly titleSelector = '.app-title';
  private readonly sideNavButton = '.sidenav-button';
  private readonly sideNav = '.sidenav';
  // private readonly sideNavOption = '[routerlink] > .mdc-list-item__content';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  getAppTitle() {
    return cy.get(this.titleSelector);
  }

  getSidenavButton() {
    return cy.get(this.sideNavButton);
  }

  getSidenav() {
    return cy.get(this.sideNav);
  }

  // getNavLink(navOption: 'Home' | 'Users') {
  //   return cy.contains(this.sideNavOption, `${navOption}`);
  // }
}
