import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { User } from './user';
import { UserCardComponent } from './user-card.component';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('User list', () => {
  let userList: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserListComponent, UserCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useClass: MockUserService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(UserListComponent);
      userList = fixture.componentInstance;
      userService = TestBed.inject(UserService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(userList).toBeTruthy();
  });

  it('should initialize with serverFilteredUsers available', () => {
    const users = userList.serverFilteredUsers();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should call getUsers() when userRole signal changes', () => {
    const spy = spyOn(userService, 'getUsers').and.callThrough();
    userList.userRole.set('admin');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ role: 'admin', age: undefined });
  });

  it('should call getUsers() when userAge signal changes', () => {
    const spy = spyOn(userService, 'getUsers').and.callThrough();
    userList.userAge.set(25);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ role: undefined, age: 25 });
  });

  it('should not show error message on successful load', () => {
    expect(userList.errMsg()).toBeUndefined();
  });
});

/*
 * This test is a little odd, but illustrates how we can use stubs
 * to create mock objects (a service in this case) that be used for
 * testing. Here we set up the mock UserService (userServiceStub) so that
 * _always_ fails (throws an exception) when you request a set of users.
 */
describe('Misbehaving User List', () => {
  let userList: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  let userServiceStub: {
    getUsers: () => Observable<User[]>;
    filterUsers: () => User[];
  };

  beforeEach(() => {
    // stub UserService for test purposes
    userServiceStub = {
      getUsers: () =>
        new Observable((observer) => {
          observer.error('getUsers() Observer generates an error');
        }),
      filterUsers: () => []
    };
  });

  // Construct the `userList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        UserListComponent
      ],
      // providers:    [ UserService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{
        provide: UserService,
        useValue: userServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    userList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("generates an error if we don't set up a UserListService", () => {
    // If the service fails, we expect the `serverFilteredUsers` signal to
    // be an empty array of users.
    expect(userList.serverFilteredUsers())
      .withContext("service can't give values to the list if it's not there")
      .toEqual([]);
    // We also expect the `errMsg` signal to contain the "Problem contacting…"
    // error message. (It's arguably a bit fragile to expect something specific
    // like this; maybe we just want to expect it to be non-empty?)
    expect(userList.errMsg())
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
  });
});
