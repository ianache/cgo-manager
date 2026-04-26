import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationModal } from './translation-modal';

describe('TranslationModal', () => {
  let component: TranslationModal;
  let fixture: ComponentFixture<TranslationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
