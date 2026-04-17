//import { Family } from 'src/app/family/family';
import { AddFamilyPage } from '../../support/add-family.po';

describe('Add family', () => {
  const page = new AddFamilyPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Family');
  });

  // it('Should be disable the add family button when family does not have a student added', () => {
  //   page.addFamilyButton().should('be.disabled');
  //   page.getFormField('guardianName').type('test');
  //   page.addFamilyButton().should('be.disabled');
  //   page.getFormField('address').type('123 Street');
  //   page.addFamilyButton().should('be.disabled');
  //   page.getFormField('timeSlot').type('9:00-10:00');
  //   page.addFamilyButton().should('be.disabled');
  //   page.getFormField('email').clear().type('familytest@email.com');

  //   page.addFamilyButton().should('be.disabled');
  // });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=guardianNameError]').should('not.exist');
    // Just clicking the guardian name field without entering anything should cause an error message
    page.getFormField('guardianName').click().blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    // Some more tests for various invalid guardian name inputs
    page.getFormField('guardianName').type('J').blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    page
      .getFormField('guardianName')
      .clear()
      .type('This is a very long name that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    // Entering a valid guardian name should remove the error.
    page.getFormField('guardianName').clear().type('John Smith').blur();
    cy.get('[data-test=guardianNameError]').should('not.exist');

    // // Before doing anything there shouldn't be an error
    // cy.get('[data-test=altPickUpError]').should('not.exist');
    // // Some more tests for various invalid guardian name inputs
    // page.getFormField('altPickUp').type('J').blur();
    // cy.get('[data-test=altPickUpError]').should('exist').and('be.visible');
    // page
    //   .getFormField('altPickUp')
    //   .clear()
    //   .type('This is a very long name that goes beyond the 50 character limit')
    //   .blur();
    // cy.get('[data-test=altPickUpError]').should('exist').and('be.visible');
    // // Entering a valid guardian name should remove the error.
    // page.getFormField('altPickUp').clear().type('John Smith').blur();
    // cy.get('[data-test=altPickUpError]').should('not.exist');


    // Before doing anything there shouldn't be an error
    cy.get('[data-test=addressError]').should('not.exist');
    // Just clicking the address field without entering anything should cause an error message
    page.getFormField('address').click().blur();
    // Entering a valid address should remove the error.
    page.getFormField('address').clear().type('123 Street').blur();
    cy.get('[data-test=addressError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=emailError]').should('not.exist');
    // Just clicking the email field without entering anything should cause an error message
    page.getFormField('email').click().blur();
    // Some more tests for various invalid email inputs
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').type('asd').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').clear().type('@example.com').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    // Entering a valid email should remove the error.
    page.getFormField('email').clear().type('family@example.com').blur();
    cy.get('[data-test=emailError]').should('not.exist');

    //need to test validation and behavior of student inputs: name, grade, school, supplies
  });

  // describe('Adding a new family', () => {
  //   beforeEach(() => {
  //     cy.task('seed:database');
  //   });

  //   it('Should go to the right page, and have the right info', () => {
  //     const family: Family = {
  //       _id: null,
  //       guardianName: 'Test Family',
  //       address: '123 Street',
  //       timeSlot: '7:00-8:00',
  //       email: 'test@email.com',
  //       students: [
  //         {
  //           name: 'Lisa',
  //           grade: '6',
  //           school: "Morris High School",
  //           requestedSupplies: []
  //         },
  //         {
  //           name: 'Allie',
  //           grade: '7',
  //           school: "Morris High School",
  //           requestedSupplies: ['headphones']
  //         },
  //         {
  //           name: 'Joe',
  //           grade: '8',
  //           school: "Morris Elementary",
  //           requestedSupplies: ['backpack', 'markers']
  //         },
  //       ]
  //     };

  //     cy.intercept('/api/family').as('addFamily');
  //     page.addFamily(family);
  //     cy.wait('@addFamily');

  //     // New URL should end in the 24 hex character Mongo ID of the newly added family.
  //     // We'll wait up to five full minutes for this these `should()` assertions to succeed.
  //     // Hopefully that long timeout will help ensure that our Cypress tests pass in
  //     // GitHub Actions, where we're often running on slow VMs.
  //     cy.url({ timeout: 300000 })
  //       .should('match', /\/family\/[0-9a-fA-F]{24}$/)
  //       .should('not.match', /\/family\/new$/);

  //     // The new family should have all the same attributes as we entered
  //     cy.get('.family-card-guardianName')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(family.guardianName));

  //     cy.get('.family-card-timeSlot')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(family.timeSlot));

  //     cy.get('.family-card-address')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(family.address));

  //     cy.get('.family-card-email')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(family.email));

  //     // We should see the confirmation message at the bottom of the screen
  //     page.getSnackBar().should('contain', `Added family ${family.guardianName}`);
  //   });
  // });
});
