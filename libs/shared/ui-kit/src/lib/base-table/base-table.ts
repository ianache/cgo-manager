import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-base-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-table.html',
  styleUrl: './base-table.css',
})
export class BaseTableComponent {
  @Input() columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' }[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;

  @Input() actionsTemplateInput?: TemplateRef<any>;
  @Input() statusTemplateInput?: TemplateRef<any>;

  @ContentChild('actionsTemplate') actionsTemplateContent?: TemplateRef<any>;
  @ContentChild('statusTemplate') statusTemplateContent?: TemplateRef<any>;

  get actionsTemplate(): TemplateRef<any> | undefined {
    return this.actionsTemplateInput ?? this.actionsTemplateContent;
  }

  get statusTemplate(): TemplateRef<any> | undefined {
    return this.statusTemplateInput ?? this.statusTemplateContent;
  }

  toBadges(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value).split(',').map(s => s.trim()).filter(Boolean);
  }

  getCellValue(row: any, key: string): any {
    if (!key.includes('.')) return row[key];
    return key.split('.').reduce((obj, part) => obj && obj[part], row);
  }
}
