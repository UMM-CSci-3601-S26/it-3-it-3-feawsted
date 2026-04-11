import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OperatorDashComponent } from './operator-dash/operator-dash.component';
import { FamilyViewComponent } from './family/family-view.component';
import { AddFamilyComponent } from './family/add-family.component';
import { InventoryTableComponent } from './inventory/inventory-table.component';
import { SupplyListComponent } from './supplylist/supplylist.component';
import { SettingsComponent } from './settings/settings.component';
import { AddSupplyListComponent } from './supplylist/add-supplylist.component';
import { ChecklistViewComponent } from './checklist/checklist-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

// Routing configuration for the application
//
// Public routes (no guards)
// -------------------------
//   /                  Home landing page — sign-up entry point
//   /login             General login (role is determined by stored account)
//   /sign-up           Volunteer self-registration
//   /guardian-sign-up  Guardian self-registration
//                      Both sign-up routes reuse SignUpComponent; the component
//                      reads router.url to determine which role to assign.
//
// Protected routes (AuthGuard + RoleGuard)
// ----------------------------------------
//   Role 'admin' only             : /dashboard, /families/new, /settings, /supplylist/new
//   Role 'admin' or 'volunteer'   : /checklists, /families, /inventory
//   Role 'admin', 'volunteer',
//         or 'guardian'           : /supplylist
//
// Future: when email-invite links are added for guardians, the link will point
// directly to /guardian-sign-up so no routing changes will be needed.
const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'login', component: LoginComponent, title: 'Login'},
  {path: 'sign-up', component: SignUpComponent, title: 'Volunteer Sign Up'},
  {path: 'guardian-sign-up', component: SignUpComponent, title: 'Guardian Sign Up'},
  {path: 'dashboard', component: OperatorDashComponent, title: 'Operator Dashboard',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }},
  {path: 'checklists', component: ChecklistViewComponent, title: 'Checklists',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'volunteer'] }},
  {path: 'families', component: FamilyViewComponent, title: 'Families',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'volunteer'] }},
  {path: 'families/new', component: AddFamilyComponent, title: 'Add Family',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }},
  {path: 'inventory', component: InventoryTableComponent, title: 'Inventory',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'volunteer'] }},
  {path: 'supplylist', component: SupplyListComponent, title: 'Supply List',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin', 'volunteer', 'guardian'] }},
  {path: 'settings', component: SettingsComponent, title: 'Settings',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }},
  {path: 'supplylist/new', component: AddSupplyListComponent, title: 'Add Supply List Item',
    canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] }}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AppRoutingModule { }
