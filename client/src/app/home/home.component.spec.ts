import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    de = fixture.debugElement.query(By.css('.home-card'));
    el = de.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the app title in the card header', () => {
    expect(el.textContent).toContain('Ready For Supplies');
  });

  it('should have a Volunteer Sign Up link pointing to /sign-up', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink="/sign-up"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Volunteer Sign Up');
  });

  it('should have a Guardian Sign Up link pointing to /guardian-sign-up', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink="/guardian-sign-up"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Guardian Sign Up');
  });

  it('should have a Log in link pointing to /login', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Log in');
  });
});
