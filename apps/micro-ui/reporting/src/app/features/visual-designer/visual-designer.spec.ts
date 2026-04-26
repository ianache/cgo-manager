import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualDesigner } from './visual-designer';

describe('VisualDesigner', () => {
  let component: VisualDesigner;
  let fixture: ComponentFixture<VisualDesigner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualDesigner],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualDesigner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
