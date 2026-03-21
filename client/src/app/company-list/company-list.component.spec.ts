import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Observable, of } from 'rxjs';
import { UserService } from '../users/user.service';
import { Company } from './company';
import { CompanyListComponent } from './company-list.component';

describe('CompanyListComponent', () => {
  let component: CompanyListComponent;
  let fixture: ComponentFixture<CompanyListComponent>;

  let userServiceStub: Partial<UserService>;

  beforeEach(async () => {
    userServiceStub = {
      getCompanies: (): Observable<Company[]> => {
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
        return of(testCompanies);
      }
    }

    await TestBed.configureTestingModule({
      imports: [CompanyListComponent],
      providers: [ { provide: UserService, useValue: userServiceStub } ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
