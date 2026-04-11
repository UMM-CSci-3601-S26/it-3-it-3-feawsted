/**
 * HomeComponent — public landing page shown to unauthenticated visitors.
 *
 * The page presents two sign-up entry points so users self-select the correct
 * registration flow before any account is created:
 *
 *   /sign-up          → volunteers (staff who will manage families/inventory)
 *   /guardian-sign-up → guardians  (family members who view supply lists)
 *
 * A general /login link is also shown for users who already have an account.
 *
 * Why split sign-up instead of login?
 * ------------------------------------
 * Login is role-agnostic — the server returns the correct role from the stored
 * record.  Sign-up must know the role up front so the server can persist it.
 * Splitting the entry point is the simplest way to capture that intent without
 * adding a role-selector dropdown to a single form.
 */
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterModule]
})
export class HomeComponent {}
