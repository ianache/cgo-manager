import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxState = 'unchecked' | 'checked' | 'indeterminate';

let nextId = 0;

@Component({
  selector: 'cgo-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly uid = `cgo-checkbox-${nextId++}`;

  @Input() label = '';
  @Input() helperText = '';
  @Input() errorMessage = '';
  @Input() size: CheckboxSize = 'md';
  @Input() disabled = false;
  @Input() required = false;

  @Input()
  get indeterminate(): boolean { return this._indeterminate; }
  set indeterminate(value: boolean) {
    this._indeterminate = value;
    this.cdr.markForCheck();
  }
  private _indeterminate = false;

  @Input()
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) {
    this._checked = value;
    if (value) this._indeterminate = false;
    this.cdr.markForCheck();
  }
  private _checked = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  get hasError(): boolean { return !!this.errorMessage; }

  get state(): CheckboxState {
    if (this._indeterminate) return 'indeterminate';
    return this._checked ? 'checked' : 'unchecked';
  }

  toggle(): void {
    if (this.disabled) return;
    this._indeterminate = false;
    this._checked = !this._checked;
    this.checkedChange.emit(this._checked);
    this.onChange(this._checked);
    this.onTouched();
    this.cdr.markForCheck();
  }

  // ControlValueAccessor
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this._checked = !!value;
    if (value) this._indeterminate = false;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
