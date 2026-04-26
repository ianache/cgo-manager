import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginError } from './login-error';

describe('LoginError', () => {
  let component: LoginError;
  let fixture: ComponentFixture<LoginError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginError],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginError);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
