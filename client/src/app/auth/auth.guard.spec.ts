// Angular Imports
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

// Guards Under Test
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth-service';

/**
 * Tests for AuthGuard — verifies that the guard allows authenticated users
 * through and redirects unauthenticated users to /login.
 */
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceStub: { loggedIn: boolean };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceStub = { loggedIn: false };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true and not navigate when the user is logged in', () => {
    authServiceStub.loggedIn = true;

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should return false and redirect to /login when not logged in', () => {
    authServiceStub.loggedIn = false;

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
