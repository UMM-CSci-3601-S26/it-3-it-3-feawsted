// Angular Imports
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

// Guard Under Test
import { RoleGuard } from './role.guard';
import { AuthService } from './auth-service';

/**
 * Tests for RoleGuard — verifies that the guard:
 *  - allows access when the user's role matches a permitted role,
 *  - redirects to / when logged in but with an insufficient role,
 *  - redirects to /login when the user is not logged in at all.
 */
describe('RoleGuard', () => {
  let guard: RoleGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceStub: { loggedIn: boolean; role: string | null };

  /** Helper that builds a minimal ActivatedRouteSnapshot with a roles data array. */
  function buildRoute(roles: string[]): ActivatedRouteSnapshot {
    const snapshot = new ActivatedRouteSnapshot();
    Object.assign(snapshot, { data: { roles } });
    return snapshot;
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceStub = { loggedIn: true, role: 'volunteer' };

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true when the user role is in the allowed list', () => {
    authServiceStub.role = 'admin';
    authServiceStub.loggedIn = true;

    expect(guard.canActivate(buildRoute(['admin']))).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should allow any role listed in the allowed roles array', () => {
    authServiceStub.role = 'guardian';
    authServiceStub.loggedIn = true;

    expect(guard.canActivate(buildRoute(['admin', 'guardian']))).toBeTrue();
  });

  it('should return false and navigate to / when role is not in allowed list', () => {
    authServiceStub.role = 'volunteer';
    authServiceStub.loggedIn = true;

    expect(guard.canActivate(buildRoute(['admin']))).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false and navigate to /login when not logged in', () => {
    authServiceStub.loggedIn = false;
    authServiceStub.role = null;

    expect(guard.canActivate(buildRoute(['admin']))).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should check the AuthGuard (loggedIn) BEFORE the role, so /login takes priority over /', () => {
    // If somehow role is set but loggedIn is false, we should still go to /login.
    authServiceStub.loggedIn = false;
    authServiceStub.role = 'volunteer';

    guard.canActivate(buildRoute(['volunteer']));

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
