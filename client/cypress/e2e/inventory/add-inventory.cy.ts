import { AddInventoryPage } from '../../support/add-inventory.po';

describe('Add inventory', () => {
  const page = new AddInventoryPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Inventory');
  });

  it('Should be disable the add inventory button when inventory does not have the item field filled', () => {
    page.addInventoryButton().should('be.disabled');
    page.getFormField('item').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('description').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('brand').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('color').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('size').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('type').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('material').type('test');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('count').type('5');
    page.addInventoryButton().should('be.disabled');
    page.getFormField('quantity').type('30');
    page.addInventoryButton().should('be.enabled');
    page.getFormField('notes').type('blahhhh');
    page.addInventoryButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=countError]').should('not.exist');
    // Just clicking the guardian name field without entering anything should cause an error message
    page.getFormField('count').click().blur();
    cy.get('[data-test=countError]').should('exist').and('be.visible');
    // Some more tests for various invalid guardian name inputs
    page.getFormField('count').type('-3').blur();
    cy.get('[data-test=countError]').should('exist').and('be.visible');
    page
      .getFormField('count')
      .clear()
      .type('This should be a positive integer')
      .blur();
    cy.get('[data-test=countError]').should('exist').and('be.visible');
    // Entering a valid guardian name should remove the error.
    page.getFormField('count').clear().type('39').blur();
    cy.get('[data-test=countError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=quantityError]').should('not.exist');
    // Just clicking the address field without entering anything should cause an error message
    page.getFormField('quantity').click().blur();
    // Entering a valid address should remove the error.
    page.getFormField('quantity').clear().type('30').blur();
    cy.get('[data-test=quantityError]').should('not.exist');


    //need to test validation and behavior of student inputs: name, grade, school, supplies
  });

  // describe('Adding a new inventory', () => {
  //   beforeEach(() => {
  //     cy.task('seed:database');
  //   });

  //   it('Should go to the right page, and have the right info', () => {
  //     const inventory: Inventory = {
  //       _id: null,
  //       guardianName: 'Test Inventory',
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

  //     cy.intercept('/api/inventory').as('addInventory');
  //     page.addInventory(inventory);
  //     cy.wait('@addInventory');

  //     // New URL should end in the 24 hex character Mongo ID of the newly added inventory.
  //     // We'll wait up to five full minutes for this these `should()` assertions to succeed.
  //     // Hopefully that long timeout will help ensure that our Cypress tests pass in
  //     // GitHub Actions, where we're often running on slow VMs.
  //     cy.url({ timeout: 300000 })
  //       .should('match', /\/inventory\/[0-9a-fA-F]{24}$/)
  //       .should('not.match', /\/inventory\/new$/);

  //     // The new inventory should have all the same attributes as we entered
  //     cy.get('.inventory-card-guardianName')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(inventory.guardianName));

  //     cy.get('.inventory-card-timeSlot')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(inventory.timeSlot));

  //     cy.get('.inventory-card-address')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(inventory.address));

  //     cy.get('.inventory-card-email')
  //       .invoke('text')
  //       .then(t => expect(t.trim()).to.equal(inventory.email));

  //     // We should see the confirmation message at the bottom of the screen
  //     page.getSnackBar().should('contain', `Added inventory ${inventory.guardianName}`);
  //   });
  // });
});
