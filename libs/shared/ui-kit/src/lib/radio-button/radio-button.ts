import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  HostBinding,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-radio-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-button.html',
  styleUrl: './radio-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent {
  private cdr = inject(ChangeDetectorRef);

  @Input() value: any;
  @Input() label = '';
  @Input() name = '';
  @Input() disabled = false;
  @Input() checked = false;

  @Output() selected = new EventEmitter<any>();

  @HostBinding('class.cgo-radio-disabled') get isDisabled() { return this.disabled; }
  @HostBinding('class.cgo-radio-checked') get isChecked() { return this.checked; }

  @HostListener('click')
  onSelect() {
    if (!this.disabled && !this.checked) {
      this.selected.emit(this.value);
    }
  }

  markForCheck() {
    this.cdr.markForCheck();
  }
}
