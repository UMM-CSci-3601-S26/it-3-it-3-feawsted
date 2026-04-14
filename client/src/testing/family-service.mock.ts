import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Family } from '../app/family/family';
import { FamilyService } from 'src/app/family/family.service';

@Injectable({
  providedIn: AppComponent
})
export class MockFamilyService implements Pick<FamilyService, 'getFamilyById' | 'getDashboardStats' | 'getFamilies' | 'exportFamilies' | 'addFamily' | 'deleteFamily'> {

  static testFamilies: Family[] = [
    {
      //family with one kid
      _id: 'john_id',
      guardianName: 'John Johnson',
      email: 'jjohnson@email.com',
      address: '713 Broadway',
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false },
      students: [
        {
          name: 'John Jr.',
          grade: '1',
          school: "Morris Elementary",
          requestedSupplies: ['pencils', 'markers']
        },
      ],
      timeSlot: ''
    },
    {
      //family with two kids
      _id: 'jane_id',
      guardianName: 'Jane Doe',
      email: 'janedoe@email.com',
      address: '123 Street',
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false },
      students: [
        {
          name: 'Jennifer',
          grade: '6',
          school: "Hancock Middle School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Jake',
          grade: '8',
          school: "Hancock Middle School",
          requestedSupplies: ['calculator']
        },
      ],
      timeSlot: ''
    },
    {
      //family with three kids
      _id: 'george_id',
      guardianName: 'George Peterson',
      email: 'georgepeter@email.com',
      address: '245 Acorn Way',
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false },
      students: [
        {
          name: 'Harold',
          grade: '11',
          school: "Morris High School",
          requestedSupplies: []
        },
        {
          name: 'Thomas',
          grade: '6',
          school: "Morris High School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Emma',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'markers']
        },
      ],
      timeSlot: ''
    },
  ];

  getDashboardStats() {
    const studentsPerSchool: { [school: string]: number } = {};
    const studentsPerGrade: { [grade: string]: number } = {};

    MockFamilyService.testFamilies.forEach(family => {
      family.students.forEach(student => {
        studentsPerSchool[student.school] =
        (studentsPerSchool[student.school] ?? 0) + 1;

        studentsPerGrade[student.grade] =
        (studentsPerGrade[student.grade] ?? 0) + 1;
      });
    });

    return of(
      {
        studentsPerSchool,
        studentsPerGrade,
        totalFamilies: MockFamilyService.testFamilies.length
      }
    );
  }

  getFamilies(): Observable<Family[]> {
    return of(MockFamilyService.testFamilies);
  }

  getFamilyById(id: string): Observable<Family> {
    const found = MockFamilyService.testFamilies.find(fam => fam._id === id);
    return of(found ?? MockFamilyService.testFamilies[0]);
  }

  addFamily(newFamily: Partial<Family>): Observable<string> {
    console.log('deleteFamily called with', newFamily);
    return of('1');
  }

  deleteFamily(id: string): Observable<string> {
    console.log('deleteFamily called with', id);
    //added above line so that "id" was being used
    return of('1');
  }

  exportFamilies(): Observable<string> {
    return of('csv-data');
  }
}
