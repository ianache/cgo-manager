import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedUiKit } from './shared-ui-kit';

describe('SharedUiKit', () => {
  let component: SharedUiKit;
  let fixture: ComponentFixture<SharedUiKit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedUiKit],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedUiKit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
