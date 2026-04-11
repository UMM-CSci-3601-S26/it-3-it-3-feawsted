// Angular Imports
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

// Service Under Test
import { AuthService } from './auth-service';

/**
 * Tests for AuthService — covers login, signup, logout, restoreSession,
 * and the loggedIn/role getters.
 *
 * sessionStorage is cleared before each test so state from one test cannot
 * bleed into the next.
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Ensure no role is left over from a previous test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Verify no unexpected HTTP requests were made
    httpTestingController.verify();
    sessionStorage.clear();
  });

  // ---- Initial state ----

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loggedIn should be false when sessionStorage is empty', () => {
    expect(service.loggedIn).toBeFalse();
  });

  it('role should be null when sessionStorage is empty', () => {
    expect(service.role).toBeNull();
  });

  // ---- login() ----

  describe('login()', () => {
    it('should POST to /api/auth/login with credentials', () => {
      service.login('alice', 'password123').subscribe();

      const req = httpTestingController.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'alice', password: 'password123' });
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ role: 'volunteer' });
    });

    it('should store the returned role in sessionStorage on success', () => {
      service.login('alice', 'password123').subscribe();

      const req = httpTestingController.expectOne('/api/auth/login');
      req.flush({ role: 'volunteer' });

      expect(service.role).toBe('volunteer');
      expect(service.loggedIn).toBeTrue();
    });

    it('loggedIn should be true after a successful login', () => {
      service.login('alice', 'password123').subscribe();

      httpTestingController.expectOne('/api/auth/login').flush({ role: 'admin' });

      expect(service.loggedIn).toBeTrue();
    });

    it('should surface an error message on failed login', (done) => {
      service.login('alice', 'wrongpass').subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Invalid username or password');
          done();
        },
      });

      httpTestingController.expectOne('/api/auth/login').flush(
        { message: 'Invalid username or password' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('should fall back to "Login failed" when error has no message', (done) => {
      service.login('alice', 'wrongpass').subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Login failed');
          done();
        },
      });

      httpTestingController.expectOne('/api/auth/login').flush(
        {},
        { status: 500, statusText: 'Server Error' }
      );
    });
  });

  // ---- signup() ----

  describe('signup()', () => {
    it('should POST to /api/auth/signup with volunteer role by default', () => {
      service.signup('bob', 'password123', 'Bob Smith').subscribe();

      const req = httpTestingController.expectOne('/api/auth/signup');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'bob',
        password: 'password123',
        fullName: 'Bob Smith',
        role: 'volunteer',
      });
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ role: 'volunteer' });
    });

    it('should POST guardian role when explicitly passed', () => {
      service.signup('carol', 'password123', 'Carol Jones', 'guardian').subscribe();

      const req = httpTestingController.expectOne('/api/auth/signup');
      expect(req.request.body.role).toBe('guardian');
      req.flush({ role: 'guardian' });
    });

    it('should store the returned role in sessionStorage on success', () => {
      service.signup('bob', 'password123', 'Bob Smith', 'volunteer').subscribe();

      httpTestingController.expectOne('/api/auth/signup').flush({ role: 'volunteer' });

      expect(service.role).toBe('volunteer');
      expect(service.loggedIn).toBeTrue();
    });

    it('should surface an error message on failed signup', (done) => {
      service.signup('taken', 'password123', 'Taken User').subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Username already exists');
          done();
        },
      });

      httpTestingController.expectOne('/api/auth/signup').flush(
        { message: 'Username already exists' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  // ---- logout() ----

  describe('logout()', () => {
    it('should POST to /api/auth/logout', () => {
      sessionStorage.setItem('auth_role', 'volunteer');
      service.logout().subscribe();

      const req = httpTestingController.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({});
    });

    it('should remove the role from sessionStorage on success', () => {
      sessionStorage.setItem('auth_role', 'volunteer');
      service.logout().subscribe();

      httpTestingController.expectOne('/api/auth/logout').flush({});

      expect(service.role).toBeNull();
      expect(service.loggedIn).toBeFalse();
    });

    it('should still clear sessionStorage even if the server call fails', () => {
      sessionStorage.setItem('auth_role', 'volunteer');
      service.logout().subscribe({ error: () => {} });

      httpTestingController.expectOne('/api/auth/logout').flush(
        {},
        { status: 500, statusText: 'Server Error' }
      );

      expect(service.role).toBeNull();
    });
  });

  // ---- restoreSession() ----

  describe('restoreSession()', () => {
    it('should GET /api/auth/me and store the returned role', () => {
      service.restoreSession().subscribe();

      const req = httpTestingController.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({ role: 'admin' });

      expect(service.role).toBe('admin');
    });

    it('should clear sessionStorage and error when cookie is missing', (done) => {
      sessionStorage.setItem('auth_role', 'volunteer');

      service.restoreSession().subscribe({
        error: () => {
          expect(service.role).toBeNull();
          done();
        },
      });

      httpTestingController.expectOne('/api/auth/me').flush(
        {},
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  // ---- role helpers ----

  describe('role helpers', () => {
    it('isAdmin() should return true when role is admin', () => {
      sessionStorage.setItem('auth_role', 'admin');
      expect(service.isAdmin()).toBeTrue();
    });

    it('isAdmin() should return false for volunteer', () => {
      sessionStorage.setItem('auth_role', 'volunteer');
      expect(service.isAdmin()).toBeFalse();
    });

    it('isVolunteer() should return true when role is volunteer', () => {
      sessionStorage.setItem('auth_role', 'volunteer');
      expect(service.isVolunteer()).toBeTrue();
    });

    it('isGuardian() should return true when role is guardian', () => {
      sessionStorage.setItem('auth_role', 'guardian');
      expect(service.isGuardian()).toBeTrue();
    });
  });
});
