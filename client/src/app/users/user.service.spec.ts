import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { User } from './user';
import { UserService } from './user.service';
import { Company } from '../company-list/company';

describe('UserService', () => {
  // A small collection of test users
  const testUsers: User[] = [
    {
      _id: 'chris_id',
      name: 'Chris',
      age: 25,
      company: 'UMM',
      email: 'chris@this.that',
      role: 'admin',
      avatar: 'https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon'
    },
    {
      _id: 'pat_id',
      name: 'Pat',
      age: 37,
      company: 'IBM',
      email: 'pat@something.com',
      role: 'editor',
      avatar: 'https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon'
    },
    {
      _id: 'jamie_id',
      name: 'Jamie',
      age: 37,
      company: 'Frogs, Inc.',
      email: 'jamie@frogs.com',
      role: 'viewer',
      avatar: 'https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon'
    }
  ];
  // A small collection of users organized by company
  const testCompanies: Company[] = [
    {
      _id: 'company1',
      count: 1,
      users: [{_id: 'user1', name: 'User 1'}]
    },
    {
      _id: 'company2',
      count: 2,
      users: [{_id: 'user2', name: 'User 2'}, {_id: 'user3', name: 'User 3'}]
    }
  ];
  let userService: UserService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getCompanies() is called with no parameters', () => {
    it('calls `api/usersByCompany`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testCompanies));

      userService.getCompanies().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(userService.usersByCompanyUrl);
      });
    }));
  });

  describe('When getUsers() is called with no parameters', () => {
    /* We really don't care what `getUsers()` returns. Since all the
    * filtering (when there is any) is happening on the server,
    * `getUsers()` is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getUsers()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testUsers`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the users. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls `api/users`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testUsers));

      // Call `userService.getUsers()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getUsers()`.
      // The `users` argument in the function is the array of Users returned by
      // the call to `getUsers()`.
      userService.getUsers().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/users' defined in the `UserService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(userService.userUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getUsers() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getUsers()` that takes in no filters in the params,
    * we really don't care what `getUsers()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getUsers()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getUsers()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testUsers`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the users. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    it('correctly calls api/users with filter parameter \'admin\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testUsers));

      userService.getUsers({ role: 'admin' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/users' defined in the `UserService`)
        //   * An options object containing an `HttpParams` with the `role`:`admin`
        //     key-value pair.
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(userService.userUrl, { params: new HttpParams().set('role', 'admin') });
      });
    });

    it('correctly calls api/users with filter parameter \'age\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testUsers));

      userService.getUsers({ age: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(userService.userUrl, { params: new HttpParams().set('age', '25') });
      });
    });

    it('correctly calls api/users with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testUsers));

      userService.getUsers({ role: 'editor', company: 'IBM', age: 37 }).subscribe(() => {
        // This test checks that the call to `userService.getUsers()` does several things:
        //   * It calls the mocked method (`HttpClient#get()`) exactly once.
        //   * It calls it with the correct endpoint (`userService.userUrl`).
        //   * It calls it with the correct parameters:
        //      * There should be three parameters (this makes sure that there aren't extras).
        //      * There should be a "role:editor" key-value pair.
        //      * And a "company:IBM" pair.
        //      * And a "age:37" pair.

        // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
        const [url, options] = mockedMethod.calls.argsFor(0);
        // Gets the `HttpParams` from the options part of the call.
        // `options.param` can return any of a broad number of types;
        // it is in fact an instance of `HttpParams`, and I need to use
        // that fact, so I'm casting it (the `as HttpParams` bit).
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(userService.userUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 3 params')
          .toEqual(3);
        expect(calledHttpParams.get('role'))
          .withContext('role of editor')
          .toEqual('editor');
        expect(calledHttpParams.get('company'))
          .withContext('company being IBM')
          .toEqual('IBM');
        expect(calledHttpParams.get('age'))
          .withContext('age being 37')
          .toEqual('37');
      });
    });
  });

  describe('When getUserById() is given an ID', () => {
    /* We really don't care what `getUserById()` returns. Since all the
    * interesting work is happening on the server, `getUserById()`
    * is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getUserById()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the `targetUser`
    * Furthermore, we won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls api/users/id with the correct ID', waitForAsync(() => {
      // We're just picking a User "at random" from our little
      // set of Users up at the top.
      const targetUser: User = testUsers[1];
      const targetId: string = targetUser._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one user from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetUser));

      // Call `userService.getUser()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getUserById()`.
      // The `user` argument in the function below is the thing of type User returned by
      // the call to `getUserById()`.
      userService.getUserById(targetId).subscribe(() => {
        // The `User` returned by `getUserById()` should be targetUser, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${userService.userUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterUsers()` (Angular/Client filtering)', () => {
    /*
     * Since `filterUsers` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    it('filters by name', () => {
      const userName = 'i';
      const filteredUsers = userService.filterUsers(testUsers, { name: userName });
      // There should be two users with an 'i' in their
      // name: Chris and Jamie.
      expect(filteredUsers.length).toBe(2);
      // Every returned user's name should contain an 'i'.
      filteredUsers.forEach(user => {
        expect(user.name.indexOf(userName)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by company', () => {
      const userCompany = 'UMM';
      const filteredUsers = userService.filterUsers(testUsers, { company: userCompany });
      // There should be just one user that has UMM as their company.
      expect(filteredUsers.length).toBe(1);
      // Every returned user's company should contain 'UMM'.
      filteredUsers.forEach(user => {
        expect(user.company.indexOf(userCompany)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by name and company', () => {
      // There's only one user (Chris) whose name
      // contains an 'i' and whose company contains
      // an 'M'. There are two whose name contains
      // an 'i' and two whose company contains an
      // an 'M', so this should test combined filtering.
      const userName = 'i';
      const userCompany = 'M';
      const filters = { name: userName, company: userCompany };
      const filteredUsers = userService.filterUsers(testUsers, filters);
      // There should be just one user with these properties.
      expect(filteredUsers.length).toBe(1);
      // Every returned user should have _both_ these properties.
      filteredUsers.forEach(user => {
        expect(user.name.indexOf(userName)).toBeGreaterThanOrEqual(0);
        expect(user.company.indexOf(userCompany)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adding a user using `addUser()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const user_id = 'pat_id';
      const expected_http_response = { id: user_id } ;

      // Mock the `httpClient.addUser()` method, so that instead of making an HTTP request,
      // it just returns our expected HTTP response.
      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      userService.addUser(testUsers[1]).subscribe((new_user_id) => {
        expect(new_user_id).toBe(user_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(userService.userUrl, testUsers[1]);
      });
    }));
  });
});
