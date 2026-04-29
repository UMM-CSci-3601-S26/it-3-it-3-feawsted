import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OperatorDashComponent } from './operator-dash/operator-dash.component';
import { FamilyViewComponent } from './family/family-view.component';
import { AddFamilyComponent } from './family/add-family.component';
import { InventoryTableComponent } from './inventory/inventory-table.component';
import { SupplyListComponent } from './supplylist/supplylist.component';
import { SettingsComponent } from './settings/settings.component';
import { AddSupplyListComponent } from './supplylist/add-supplylist.component';
import { ChecklistViewComponent } from './checklist/checklist-view.component';

// Routing configuration for the application
const routes: Routes = [
  {path: 'dashboard', component: OperatorDashComponent, title: 'Operator Dashboard'},
  {path: 'checklists', component: ChecklistViewComponent, title: 'Checklists'},
  {path: 'families', component: FamilyViewComponent, title: 'Families'},
  {path: 'families/new', component: AddFamilyComponent, title: 'Add Family'},
  {path: 'inventory', component: InventoryTableComponent, title: 'Inventory'},
  {path: 'supplylist', component: SupplyListComponent, title: 'Supply List'},
  {path: 'settings', component: SettingsComponent, title: 'Settings'},
  {path: 'supplylist/new', component: AddSupplyListComponent, title: 'Add Supply List Item'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
