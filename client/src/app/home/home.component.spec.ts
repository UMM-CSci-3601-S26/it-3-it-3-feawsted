import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HomeComponent } from './home.component';

/// Unit tests for the HomeComponent. This test suite verifies that the component is created successfully and
describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  // Set up the testing environment before each test case
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Get the DebugElement and native element for the home card
    de = fixture.debugElement.query(By.css('.home-card'));
    el = de.nativeElement;
  });

  // Test case to verify that the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case to verify that the home page contains the expected text
  it('It has the basic home page text', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain('This is a home page! It doesn\'t do anything!');
    expect(component).toBeTruthy();
  });

});
