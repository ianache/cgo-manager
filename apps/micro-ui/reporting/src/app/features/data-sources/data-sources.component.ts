import { Component, ViewChild, TemplateRef, AfterViewInit, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, DataSource } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatedTableComponent, FormHeaderComponent, ButtonComponent],
  template: `
    <div class="datasources-page">
      <cgo-form-header
        title="Data Sources"
        description="Connect and manage your analytical infrastructure. Integrate XMLA cubes, SQL databases, and REST endpoints.">
        <div actions>
          <cgo-button variant="primary" routerLink="../data-sources/create">
            <span class="material-symbols-outlined">add</span>
            New Data Source
          </cgo-button>
        </div>
      </cgo-form-header>

      <div class="table-card cloud-shadow">
        <cgo-paginated-table
          [columns]="columns"
          [data]="dataSources()"
          [pageSize]="10"
          [showActions]="true"
          [customTemplates]="customTemplates">
          
          <ng-template #statusCellTpl let-value>
            <span class="status-pill" [ngClass]="value === 'active' ? 'status-active' : 'status-inactive'">
              {{ value === 'active' ? 'Active' : 'Inactive' }}
            </span>
          </ng-template>

          <ng-template #actionsTemplate let-ds>
            <div class="table-actions">
              <button class="icon-btn" title="Edit" [routerLink]="['../data-sources', ds.id, 'edit']">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="icon-btn" title="Sync Status">
                <span class="material-symbols-outlined">sync</span>
              </button>
            </div>
          </ng-template>
        </cgo-paginated-table>
      </div>
    </div>
  `,
  styles: [`
    .datasources-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    .table-card { background: white; border-radius: 8px; overflow: hidden; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }
    
    .status-pill { padding: 4px 12px; border-radius: 999px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; }
    .status-active { background: #e8f5e9; color: #1b5e20; }
    .status-inactive { background: #f5f5f5; color: #757575; }
    
    .table-actions { display: flex; gap: 8px; justify-content: center; }
    .icon-btn { background: none; border: none; padding: 6px; border-radius: 4px; color: #506169; cursor: pointer; transition: all 0.2s; }
    .icon-btn:hover { background: #f1f3f4; color: #bb0012; }
  `]
})
export class DataSourcesComponent implements OnInit, AfterViewInit {
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  
  dataSources = signal<DataSource[]>([]);
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'Source Name' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'last_sync', label: 'Last Sync' }
  ];
  customTemplates: any = {};

  ngOnInit() {
    this.loadDataSources();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        status: this.statusCellTpl
      };
    });
  }

  loadDataSources() {
    this.api.getDataSources().subscribe({
      next: (data) => this.dataSources.set(data),
      error: (err) => console.error('Error loading data sources', err)
    });
  }
}
