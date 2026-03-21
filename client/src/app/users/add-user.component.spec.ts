import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { AddUserComponent } from './add-user.component';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';

describe('AddUserComponent', () => {
  let addUserComponent: AddUserComponent;
  let addUserForm: FormGroup;
  let fixture: ComponentFixture<AddUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddUserComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useClass: MockUserService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    addUserComponent = fixture.componentInstance;
    fixture.detectChanges();
    addUserForm = addUserComponent.addUserForm;
    expect(addUserForm).toBeDefined();
    expect(addUserForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addUserComponent).toBeTruthy();
    expect(addUserForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addUserForm.valid).toBeFalsy();
  });

  describe('The name field', () => {
    let nameControl: AbstractControl;

    beforeEach(() => {
      nameControl = addUserComponent.addUserForm.controls.name;
    });

    it('should not allow empty names', () => {
      nameControl.setValue('');
      expect(nameControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      nameControl.setValue('Chris Smith');
      expect(nameControl.valid).toBeTruthy();
    });

    it('should fail on single character names', () => {
      nameControl.setValue('x');
      expect(nameControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(nameControl.hasError('minlength')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like name lengths just
    // because there are people with really long names.
    it('should fail on really long names', () => {
      nameControl.setValue('x'.repeat(100));
      expect(nameControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      expect(nameControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the name', () => {
      nameControl.setValue('Bad2Th3B0ne');
      expect(nameControl.valid).toBeTruthy();
    });

    it('should fail if we provide an "existing" name', () => {
      // We're assuming that "abc123" and "123abc" already
      // exist so we disallow them.
      nameControl.setValue('abc123');
      expect(nameControl.valid).toBeFalsy();
      expect(nameControl.hasError('existingName')).toBeTruthy();

      nameControl.setValue('123abc');
      expect(nameControl.valid).toBeFalsy();
      expect(nameControl.hasError('existingName')).toBeTruthy();
    });
  });

  describe('The age field', () => {
    let ageControl: AbstractControl;

    beforeEach(() => {
      ageControl = addUserComponent.addUserForm.controls.age;
    });

    it('should not allow empty ages', () => {
      ageControl.setValue('');
      expect(ageControl.valid).toBeFalsy();
    });

    it('should be fine with "27"', () => {
      ageControl.setValue('27');
      expect(ageControl.valid).toBeTruthy();
    });

    it('should fail on ages that are too low', () => {
      ageControl.setValue('14');
      expect(ageControl.valid).toBeFalsy();
      expect(ageControl.hasError('min')).toBeTruthy();
    });

    it('should fail on negative ages', () => {
      ageControl.setValue('-27');
      expect(ageControl.valid).toBeFalsy();
      expect(ageControl.hasError('min')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like ages.
    it('should fail on ages that are too high', () => {
      ageControl.setValue(201);
      expect(ageControl.valid).toBeFalsy();
      // I have no idea why I have to use a lower case 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      // But I apparently do.
      expect(ageControl.hasError('max')).toBeTruthy();
    });

    it('should not allow an age to contain a decimal point', () => {
      ageControl.setValue(27.5);
      expect(ageControl.valid).toBeFalsy();
      expect(ageControl.hasError('pattern')).toBeTruthy();
    });
  });

  describe('The company field', () => {
    it('should allow empty values', () => {
      const companyControl = addUserForm.controls.company;
      companyControl.setValue('');
      expect(companyControl.valid).toBeTruthy();
    });
  });

  describe('The email field', () => {
    let emailControl: AbstractControl;

    beforeEach(() => {
      emailControl = addUserComponent.addUserForm.controls.email;
    });

    it('should not allow empty values', () => {
      emailControl.setValue('');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('required')).toBeTruthy();
    });

    it('should accept legal emails', () => {
      emailControl.setValue('conniestewart@ohmnet.com');
      expect(emailControl.valid).toBeTruthy();
    });

    it('should fail without @', () => {
      emailControl.setValue('conniestewart');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('email')).toBeTruthy();
    });
  });

  describe('The role field', () => {
    let roleControl: AbstractControl;

    beforeEach(() => {
      roleControl = addUserForm.controls.role;
    });

    it('should not allow empty values', () => {
      roleControl.setValue('');
      expect(roleControl.valid).toBeFalsy();
      expect(roleControl.hasError('required')).toBeTruthy();
    });

    it('should allow "admin"', () => {
      roleControl.setValue('admin');
      expect(roleControl.valid).toBeTruthy();
    });

    it('should allow "editor"', () => {
      roleControl.setValue('editor');
      expect(roleControl.valid).toBeTruthy();
    });

    it('should allow "viewer"', () => {
      roleControl.setValue('viewer');
      expect(roleControl.valid).toBeTruthy();
    });

    it('should not allow "Supreme Overlord"', () => {
      roleControl.setValue('Supreme Overlord');
      expect(roleControl.valid).toBeFalsy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addUserValidationMessages`
      // map in the component.
      let controlName: keyof typeof addUserComponent.addUserValidationMessages = 'name';
      addUserComponent.addUserForm.get(controlName).setErrors({'required': true});
      expect(addUserComponent.getErrorMessage(controlName)).toEqual('Name is required');

      // We don't need the type statement here because we're not using the
      // same (previously typed) variable. We could use a `let` and the type statement
      // if we wanted to create a new variable, though.
      controlName = 'email';
      addUserComponent.addUserForm.get(controlName).setErrors({'required': true});
      expect(addUserComponent.getErrorMessage(controlName)).toEqual('Email is required');

      controlName = 'email';
      addUserComponent.addUserForm.get(controlName).setErrors({'email': true});
      expect(addUserComponent.getErrorMessage(controlName)).toEqual('Email must be formatted properly');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addUserValidationMessages`
      // map in the component.
      const controlName: keyof typeof addUserComponent.addUserValidationMessages = 'name';
      addUserComponent.addUserForm.get(controlName).setErrors({'unknown': true});
      expect(addUserComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:
//
// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock
//
// Is how these tests work with the mock then being injected in

describe('AddUserComponent#submitForm()', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let userService: UserService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddUserComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: UserService, useClass: MockUserService }, // A (more-async-tests) - provide + use class of the mock
        provideRouter([
          { path: 'users/1', component: UserProfileComponent }
        ])]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addUserForm.controls.name.setValue('Chris Smith');
    component.addUserForm.controls.age.setValue(27);
    component.addUserForm.controls.company.setValue('Ohmnet');
    component.addUserForm.controls.email.setValue('this@that.com');
    component.addUserForm.controls.role.setValue('admin');
  });

  // The `fakeAsync()` wrapper is necessary because the `submitForm()` method
  // calls `navigate()` on the router, which is an asynchronous operation, and we
  // need to wait (using `tick()`) for that to complete before we can check the
  // new location.
  it('should call addUser() and handle success response', fakeAsync(() => {
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return a canned response ('1').
    // This means we don't have to worry about the details of the `.addUser()`,
    // or actually have a server running to receive the HTTP request that
    // `.addUser()` would typically generate. Note also that the particular values
    // we set up in our form (e.g., 'Chris Smith') are actually ignored
    // thanks to our `spyOn()` call.
    const addUserSpy = spyOn(userService, 'addUser').and.returnValue(of('1'));
    component.submitForm();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm.value);
    // Wait for the router to navigate to the new page. This is necessary since
    // navigation is an asynchronous operation.
    tick();
    // Now we can check that the router actually navigated to the right place.
    expect(location.path()).toBe('/users/1');
    // Flush any pending microtasks. This is necessary to ensure that the
    // timer generated by `fakeAsync()` completes before the test finishes.
    flush();
  }));

  // This doesn't need `fakeAsync()`, `tick()`, or `flush() because the
  // error case doesn't navigate to another page. It just displays an error
  // message in the snackbar. So, we don't need to worry about the asynchronous
  // nature of navigation.
  it('should call addUser() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = spyOn(userService, 'addUser')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });


  it('should call addUser() and handle error response for illegal user', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 400, message: 'Illegal user error' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = spyOn(userService, 'addUser')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addUser() and handle unexpected error response if it arises', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 404, message: 'Not found' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = spyOn(userService, 'addUser')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
