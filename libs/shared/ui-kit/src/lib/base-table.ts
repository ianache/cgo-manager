import { Component, Input, ContentChild, TemplateRef } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-base-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-table.html',
  styleUrl: './base-table.css',
})
export class BaseTableComponent {
  @Input() columns: { key: string; label: string }[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;
  
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;
  @ContentChild('statusTemplate') statusTemplate?: TemplateRef<any>;
}
