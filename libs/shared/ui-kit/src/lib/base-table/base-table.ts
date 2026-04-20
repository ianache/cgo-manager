import { Component, Input, ContentChild, TemplateRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cgo-base-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-table.html',
  styleUrl: './base-table.css',
})
export class BaseTableComponent {
  @Input() columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' | 'checkbox' | 'custom' }[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;

  @Input() actionsTemplateInput?: TemplateRef<any>;
  
  // Map for custom templates provided via Input
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {};

  @ContentChild('actionsTemplate') actionsTemplateContent?: TemplateRef<any>;

  get actionsTemplate(): TemplateRef<any> | undefined {
    return this.actionsTemplateInput ?? this.actionsTemplateContent;
  }

  getTemplate(columnKey: string): TemplateRef<any> | undefined {
    return this.customTemplates[columnKey];
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
