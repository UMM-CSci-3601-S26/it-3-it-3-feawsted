import { Inventory } from 'src/app/inventory/inventory';

export class AddInventoryPage {

  private readonly url = '/inventory/new';
  private readonly title = '.add-inventory-title';
  private readonly button = '[data-test=confirmAddInventoryButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly itemField = 'item';
  private readonly descriptionField = 'description';
  private readonly brandField = 'brand';
  private readonly colorField = 'color';
  private readonly sizeField = 'size';
  private readonly typeField = 'type';
  private readonly materialField = 'material';
  private readonly countField = 'count';
  private readonly quantityField = 'quantity';
  private readonly notesField = 'notes';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addInventoryButton() {
    return cy.get(this.button);
  }

  getFormField(fieldName: string) {
    return cy.get(`[formcontrolname="${fieldName}"]`); //removed ${this.formFieldSelector}
  }

  getSnackBar() {
    // Since snackBars are often shown in response to errors,
    // we'll add a timeout of 10 seconds to help increase the likelihood that
    // the snackbar becomes visible before we might fail because it
    // hasn't (yet) appeared.
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addInventory(newInventory: Inventory) {
    this.getFormField(this.itemField).type(newInventory.item);
    this.getFormField(this.descriptionField).type(newInventory.description);
    this.getFormField(this.brandField).type(newInventory.brand);
    this.getFormField(this.colorField).type(newInventory.color);
    this.getFormField(this.sizeField).type(newInventory.size);
    this.getFormField(this.typeField).type(newInventory.type);
    this.getFormField(this.materialField).type(newInventory.material);
    this.getFormField(this.countField).type(newInventory.count.toString());
    this.getFormField(this.quantityField).type(newInventory.quantity.toString());
    this.getFormField(this.notesField).type(newInventory.notes);

    return this.addInventoryButton().click();
  }
}
