import {
  Component,
  Input,
  forwardRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioButtonComponent } from './radio-button';
import { Subject, takeUntil, startWith } from 'rxjs';

@Component({
  selector: 'cgo-radio-group',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="radio-group-container" [class.vertical]="direction === 'vertical'"><ng-content></ng-content></div>`,
  styles: [`
    .radio-group-container {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    .radio-group-container.vertical {
      flex-direction: column;
      gap: 12px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
  ],
})
export class RadioGroupComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
  @Input() name = '';

  @ContentChildren(RadioButtonComponent, { descendants: true }) 
  radios!: QueryList<RadioButtonComponent>;

  private _value: any;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterContentInit() {
    this.radios.changes
      .pipe(startWith(this.radios), takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateRadios();
      });
  }

  private updateRadios() {
    if (!this.radios) return;

    this.radios.forEach(radio => {
      radio.checked = radio.value === this._value;
      radio.name = this.name;
      
      radio.selected.pipe(takeUntil(this.destroy$)).subscribe(value => {
        this.select(value);
      });
      
      radio.markForCheck();
    });
  }

  private select(value: any) {
    this._value = value;
    this.updateRadios();
    this.onChange(value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this._value = value;
    if (this.radios) {
      this.updateRadios();
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    if (this.radios) {
      this.radios.forEach(r => {
        r.disabled = isDisabled;
        r.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
