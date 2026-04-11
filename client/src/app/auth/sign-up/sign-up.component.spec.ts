// Angular Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

// Component and Dependencies
import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../auth-service';

/**
 * Tests for SignUpComponent.
 *
 * The component is mounted on two routes:
 *   /sign-up          → volunteer registration
 *   /guardian-sign-up → guardian registration
 *
 * The default test setup (provideRouter([])) leaves the URL as '/', so
 * isGuardianRoute is false and the volunteer code-path runs.
 *
 * For guardian tests we directly replace the injected `router` property with
 * a spy that has url='/guardian-sign-up', which is the simplest way to control
 * the URL seen by the component without needing full router navigation.
 */
describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authServiceMock: jasmine.SpyObj<Pick<AuthService, 'signup'>>;

  beforeEach(waitForAsync(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['signup']);

    TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Basic creation ----

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---- Volunteer route (default URL = '/') ----

  it('isGuardianRoute should be false when not on /guardian-sign-up', () => {
    expect(component.isGuardianRoute).toBeFalse();
  });

  it('pageTitle should be "Volunteer Sign Up" on the volunteer route', () => {
    expect(component.pageTitle).toBe('Volunteer Sign Up');
  });

  it('pageSubtitle should mention "volunteer account" on the volunteer route', () => {
    expect(component.pageSubtitle).toContain('volunteer');
  });

  // ---- Form validation ----

  it('form should be invalid when all fields are empty', () => {
    expect(component.signupForm.valid).toBeFalse();
  });

  it('password control should be invalid when fewer than 8 characters', () => {
    component.signupForm.controls['password'].setValue('short');
    expect(component.signupForm.controls['password'].valid).toBeFalse();
  });

  it('password control should be valid with 8 or more characters', () => {
    component.signupForm.controls['password'].setValue('strongpass');
    expect(component.signupForm.controls['password'].valid).toBeTrue();
  });

  it('form should be valid when all fields satisfy constraints', () => {
    component.signupForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    });
    expect(component.signupForm.valid).toBeTrue();
  });

  // ---- Submit behaviour ----

  it('should not call signup when form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  });

  it('should call authService.signup with "volunteer" role on valid submit', () => {
    authServiceMock.signup.and.returnValue(of({ role: 'volunteer' }));
    component.signupForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    });

    component.onSubmit();

    expect(authServiceMock.signup).toHaveBeenCalledWith(
      'testuser', 'password123', 'Test User', 'volunteer'
    );
  });

  it('should display the error message when signup fails', () => {
    authServiceMock.signup.and.returnValue(
      throwError(() => new Error('Username already exists'))
    );
    component.signupForm.setValue({
      fullName: 'Test User',
      username: 'taken',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.error).toBe('Username already exists');
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to true while the signup request is in flight', () => {
    // Using a never-completing observable to keep isLoading=true
    authServiceMock.signup.and.returnValue(new Observable(() => {}));
    component.signupForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
  });

  // ---- Guardian route variant ----

  describe('on /guardian-sign-up', () => {
    beforeEach(() => {
      // Replace the injected Router with a spy that reports the guardian URL.
      // This is safe because the component only reads router.url and calls
      // router.navigate(), both of which the spy covers.
      (component as { router: Router }).router = jasmine.createSpyObj(
        'Router', ['navigate'], { url: '/guardian-sign-up' }
      );
    });

    it('isGuardianRoute should be true', () => {
      expect(component.isGuardianRoute).toBeTrue();
    });

    it('pageTitle should be "Guardian Sign Up"', () => {
      expect(component.pageTitle).toBe('Guardian Sign Up');
    });

    it('pageSubtitle should mention "family"', () => {
      expect(component.pageSubtitle).toContain('family');
    });

    it('should call authService.signup with "guardian" role on valid submit', () => {
      authServiceMock.signup.and.returnValue(of({ role: 'guardian' }));
      component.signupForm.setValue({
        fullName: 'Guardian User',
        username: 'guardian1',
        password: 'password123',
      });

      component.onSubmit();

      expect(authServiceMock.signup).toHaveBeenCalledWith(
        'guardian1', 'password123', 'Guardian User', 'guardian'
      );
    });
  });
});
