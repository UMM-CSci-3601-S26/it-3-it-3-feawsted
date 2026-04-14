
import { ChecklistViewPage } from '../../support/checklist-view.po';

const page = new ChecklistViewPage();

describe('Checklist view', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getChecklistTitle().should('have.text', 'Checklists');
  });

  it('Should show display checklists after loading', () => {
    //Checking for the presence of checklist cards
    page.getChecklistCards().should('exist');
  });

  it('Should show an error message if server fails', () => {
    //Intercepting the GET request to /api/checklists and simulating a server error with a 500 status code
    cy.intercept('GET', '/api/checklists*', { statusCode: 500 }).as('fail');

    //Reload the page to trigger the GET request and wait for the intercepted request to complete
    page.navigateTo();
    cy.wait('@fail');

    //Asserting that an error message is displayed on the page, which indicates that the application is handling the server error gracefully
    cy.get('simple-snack-bar, .error-message, mat-error').should('contain.text', 'problem loading');
  });

  it('Should export checklists as PDF when export button is clicked', () => {
    //way to reference the real window we are running
    cy.window().then(win => {
      //win.URL.createObjectURL is called when the file is generated and ready to be downloaded
      //cy.stub(..) replaces the real implementation of createObjectURL with a stub that we can monitor
      //We don't care about the actual file being downloaded, just that the function to create the download link is called
      cy.stub(win.URL, 'createObjectURL').as('createObjectURL');
    });

    //export button is clicked
    page.getExportPDFButton().click();

    cy.wait(500); // Wait for the file to be generated and downloaded
    //This asserts that @creatObjectURL was called, which indicates that the file was generated and the download process was initiated
    cy.get('@createObjectURL').should('have.been.called');
  });

  it('Should get error message if export fails', () => {
    //Intercepting the GET request to /api/checklists/export and simulating a server error with a 500 status code
    cy.intercept('GET', '/api/checklists*', { statusCode: 500 }).as('exportFail');

    //Click the export button to trigger the GET request and wait for the intercepted request to complete
    page.getExportPDFButton().click();
    cy.wait('@exportFail');

    //Asserting that an error message is displayed on the page, which indicates that the application is handling the export error gracefully
    cy.get('simple-snack-bar').should('contain.text', 'Problem contacting the server');
  });

  // it('Should click add checklist and go to the right URL', () => {
  //   // Click on the button for adding a new checklist
  //   page.addChecklistButton().click();

  //   // The URL should end with '/checklists/new'
  //   cy.url().should(url => expect(url.endsWith('/checklists/new')).to.be.true);

  //   // On the page we were sent to, We should see the right title
  //   cy.get('.add-checklist-title').should('have.text', 'New Checklist');
  // });

});
