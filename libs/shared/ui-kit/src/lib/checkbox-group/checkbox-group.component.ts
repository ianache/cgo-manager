import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from '../checkbox/checkbox.component';

export interface CheckboxGroupItem {
  id: string | number;
  label: string;
  helperText?: string;
  disabled?: boolean;
  checked?: boolean;
}

@Component({
  selector: 'cgo-checkbox-group',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxGroupComponent implements OnChanges {
  @Input() label = '';
  @Input() helperText = '';
  @Input() items: CheckboxGroupItem[] = [];
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() itemsChange = new EventEmitter<CheckboxGroupItem[]>();
  @Output() selectionChange = new EventEmitter<(string | number)[]>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.syncItems();
    }
  }

  get allChecked(): boolean {
    return this.items.length > 0 && this.enabledItems.every(i => i.checked);
  }

  get someChecked(): boolean {
    return this.enabledItems.some(i => i.checked) && !this.allChecked;
  }

  get selectedIds(): (string | number)[] {
    return this.items.filter(i => i.checked).map(i => i.id);
  }

  private get enabledItems(): CheckboxGroupItem[] {
    return this.items.filter(i => !i.disabled);
  }

  toggleAll(checked: boolean): void {
    this.items = this.items.map(item =>
      item.disabled ? item : { ...item, checked }
    );
    this.emit();
  }

  toggleItem(id: string | number, checked: boolean): void {
    this.items = this.items.map(item =>
      item.id === id ? { ...item, checked } : item
    );
    this.emit();
  }

  private syncItems(): void {
    this.items = this.items.map(item => ({ checked: false, ...item }));
  }

  private emit(): void {
    this.itemsChange.emit([...this.items]);
    this.selectionChange.emit(this.selectedIds);
  }
}
