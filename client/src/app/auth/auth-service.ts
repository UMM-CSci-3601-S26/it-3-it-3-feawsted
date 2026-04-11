/**
 * AuthService — the single source of truth for authentication state in the
 * Angular app.
 *
 * How authentication works end-to-end
 * ------------------------------------
 * 1. The user submits a login or signup form.
 * 2. This service POSTs the credentials to the server over HTTPS.
 * 3. The server validates the credentials, creates a signed JWT, and writes it
 *    into an HttpOnly cookie called "auth_token".  Because the cookie is
 *    HttpOnly, JavaScript in this app can NEVER read or steal the token —
 *    that is the key XSS protection.
 * 4. The server returns only { role } in the JSON body.  We store that
 *    in sessionStorage so we know what UI to show.  sessionStorage is cleared
 *    automatically when the browser tab is closed.
 * 5. On every subsequent API request the browser automatically includes the
 *    cookie (AuthInterceptor adds withCredentials:true to ensure this).
 * 6. The server's AuthMiddleware reads the cookie, validates the JWT signature
 *    and expiry, and rejects requests with 401/403 if the token is invalid.
 * 7. logout() calls POST /api/auth/logout, which tells the server to overwrite
 *    the cookie with an empty value and maxAge=0, causing the browser to delete
 *    it.  Then sessionStorage is cleared.
 * 8. restoreSession() calls GET /api/auth/me to check whether a valid server-
 *    side cookie still exists (e.g. after a page reload).  If it does, the
 *    role is written back into sessionStorage so the UI is restored correctly.
 */
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { tap, catchError } from "rxjs";
import { throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private roleKey = 'auth_role';
  private apiUrl = '/api/auth';

  http = inject(HttpClient);

  login(username: string, password: string) {
    // The server sets the HttpOnly auth_token cookie; we only receive the role.
    return this.http.post<{ role: string }>(
      `${this.apiUrl}/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        sessionStorage.setItem(this.roleKey, res.role);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  signup(username: string, password: string, fullName: string, role: 'volunteer' | 'guardian' = 'volunteer') {
    return this.http.post<{ role: string }>(
      `${this.apiUrl}/signup`,
      { username, password, fullName, role },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        sessionStorage.setItem(this.roleKey, res.role);
      }),
      catchError(error => {
        console.error('Signup failed:', error);
        return throwError(() => new Error(error.error?.message || 'Signup failed'));
      })
    );
  }

  get role() {
    return sessionStorage.getItem(this.roleKey);
  }

  get loggedIn() {
    return !!this.role;
  }

  logout() {
    // Ask the server to clear the HttpOnly cookie, then wipe client state.
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => sessionStorage.removeItem(this.roleKey)),
      catchError(() => {
        sessionStorage.removeItem(this.roleKey);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  /**
   * Restore the session from a valid server-side cookie (e.g. after a tab is
   * reopened). Returns an Observable that emits the role on success or errors
   * if the cookie is missing/expired.
   */
  restoreSession() {
    return this.http.get<{ role: string }>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(res => {
        sessionStorage.setItem(this.roleKey, res.role);
      }),
      catchError(error => {
        sessionStorage.removeItem(this.roleKey);
        return throwError(() => error);
      })
    );
  }

  // Role checkers
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isVolunteer(): boolean {
    return this.role === 'volunteer';
  }

  isGuardian(): boolean {
    return this.role === 'guardian';
  }
}

