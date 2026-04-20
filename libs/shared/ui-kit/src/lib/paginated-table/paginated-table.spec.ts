import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedTableComponent } from './paginated-table';

describe('PaginatedTableComponent', () => {
  let component: PaginatedTableComponent;
  let fixture: ComponentFixture<PaginatedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatedTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
