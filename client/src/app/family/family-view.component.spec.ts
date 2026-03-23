import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockFamilyService } from 'src/testing/family-service.mock';
import { FamilyViewComponent } from './family-view.component';
import { FamilyService } from './family.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { Family } from './family';

describe('Family list', () => {
  let familyList: FamilyViewComponent;
  let fixture: ComponentFixture<FamilyViewComponent>;
  let familyService: FamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FamilyViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FamilyService, useClass: MockFamilyService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(FamilyViewComponent);
      familyList = fixture.componentInstance;
      familyService = TestBed.inject(FamilyService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(familyList).toBeTruthy();
  });

  it('should load families from service', () => {
    const families = familyList.families();
    //there is one family
    expect(families.length).toBe(3);
    //the guardian of that family is Chris
    expect(families[0].guardianName).toBe('John Johnson');
  });

  //Does this not provide any coverage for the CSV test?????
  it('exportFamilies() should be called when CSV is downloaded', () => {
    spyOn(familyService, 'exportFamilies').and.returnValue(of('csv-data'));

    spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(URL, 'revokeObjectURL');

    const click = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.returnValue({ click } as undefined);

    familyList.downloadCSV();
    expect(familyService.exportFamilies).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
});

describe('Misbehaving Family List', () => {
  let familyList: FamilyViewComponent;
  let fixture: ComponentFixture<FamilyViewComponent>;

  let familyServiceStub: {
    getFamilies: () => Observable<Family[]>;
    exportFamilies: () => Observable<string>;
  };

  beforeEach(() => {
    // stub FamilyService for test purposes
    familyServiceStub = {
      getFamilies: () =>
        new Observable((observer) => {
          observer.error('getFamilies() Observer generates an error');
        }),
      exportFamilies: () => of('')
    };
  });

  // Construct the `familyList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FamilyViewComponent
      ],
      // providers:    [ FamilyService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{
        provide: FamilyService,
        useValue: familyServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyViewComponent);
    familyList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('it will return an empty array when the service experiences an error', () => {
    expect(familyList.families()).toEqual([]); //familyList should return an empty array
  });
});
