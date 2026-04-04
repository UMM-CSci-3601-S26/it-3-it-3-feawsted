import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OperatorDashComponent } from './operator-dash/operator-dash.component';
import { FamilyViewComponent } from './family/family-view.component';
import { AddFamilyComponent } from './family/add-family.component';
import { InventoryTableComponent } from './inventory/inventory-table.component';
import { SupplyListComponent } from './supplylist/supplylist.component';
import { SettingsComponent } from './settings/settings.component';

// Routing configuration for the application
const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'dashboard', component: OperatorDashComponent, title: 'Operator Dashboard'},
  {path: 'families', component: FamilyViewComponent, title: 'Families'},
  {path: 'families/new', component: AddFamilyComponent, title: 'Add Family'},
  {path: 'inventory', component: InventoryTableComponent, title: 'Inventory'},
  {path: 'supplylist', component: SupplyListComponent, title: 'Supply List'},
  {path: 'settings', component: SettingsComponent, title: 'Settings'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
