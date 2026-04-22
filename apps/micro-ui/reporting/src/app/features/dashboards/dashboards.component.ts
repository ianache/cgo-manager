import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaginatedTableComponent, 
  GenericCardComponent, 
  ButtonComponent 
} from '@cgomanager/shared-ui-kit';
import { ApiService, ReportDefinition } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-reporting-dashboards',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PaginatedTableComponent, 
    GenericCardComponent,
    ButtonComponent
  ],
  template: `
    <div class="dashboards-page">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">Reports Management</h2>
          <p class="page-description">Manage and design your operational reports and data snapshots.</p>
        </div>
        
        <div class="header-actions">
          <div class="view-toggle cloud-shadow">
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'table'"
              (click)="viewMode.set('table')"
              title="Table View">
              <span class="material-symbols-outlined">table_rows</span>
            </button>
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'card'"
              (click)="viewMode.set('card')"
              title="Card View">
              <span class="material-symbols-outlined">grid_view</span>
            </button>
          </div>

          <cgo-button 
            variant="primary" 
            routerLink="../designer">
            <span class="material-symbols-outlined">add_chart</span>
            Create New Report
          </cgo-button>
        </div>
      </div>

      <div class="content-area">
        <ng-container *ngIf="viewMode() === 'table'">
          <cgo-paginated-table
            [columns]="columns"
            [data]="reports()"
            [pageSize]="10"
            [showActions]="true"
            [showHeader]="true"
            [showHeaderSearch]="true"
            headerTitle="Existing Reports Catalog"
            headerDescription="Browse and manage all previously created report definitions.">
            <ng-template #actionsTemplate let-report>
              <div class="table-actions">
                <button class="icon-btn" title="View"><span class="material-symbols-outlined">visibility</span></button>
                <button class="icon-btn" title="Edit" [routerLink]="['../designer', report.id]"><span class="material-symbols-outlined">edit</span></button>
                <button class="icon-btn" title="Delete"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </ng-template>
          </cgo-paginated-table>
        </ng-container>

        <ng-container *ngIf="viewMode() === 'card'">
          <div class="report-grid">
            @for (report of reports(); track report.id) {
              <cgo-generic-card [clickable]="true">
                <div card-image class="report-card-icon">
                  <span class="material-symbols-outlined">description</span>
                </div>
                <h4 card-title class="report-name">{{ report.name }}</h4>
                <p card-subtitle class="report-meta">Cube: {{ report.cubeName }} | Format: {{ report.format }}</p>
                
                <div class="report-card-footer" card-footer>
                  <span class="destination-tag">
                    <span class="material-symbols-outlined">send</span>
                    {{ report.delivery.destination }}
                  </span>
                  <div class="card-actions">
                    <button class="icon-btn" [routerLink]="['../designer', report.id]"><span class="material-symbols-outlined">edit</span></button>
                    <button class="icon-btn"><span class="material-symbols-outlined">more_vert</span></button>
                  </div>
                </div>
              </cgo-generic-card>
            }
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .dashboards-page { 
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end;
    }

    .page-title { 
      font-size: 2rem; 
      font-weight: 700; 
      margin: 0; 
      color: var(--inverse-surface); 
    }

    .page-description { 
      margin: 8px 0 0; 
      color: var(--secondary-grey); 
      font-weight: 500; 
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .view-toggle {
      display: flex;
      background: var(--surface-lowest);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--surface-highest);
    }

    .toggle-btn {
      background: none;
      border: none;
      padding: 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--secondary-grey);
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: var(--surface-container);
      color: var(--primary-red);
    }

    .cloud-shadow { box-shadow: var(--shadow-cloud); }

    .content-area {
      flex: 1;
    }

    .report-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .report-card-icon {
      height: 140px;
      background: var(--surface-low);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-red);
    }

    .report-card-icon .material-symbols-outlined {
      font-size: 48px;
    }

    .report-name {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--inverse-surface);
    }

    .report-meta {
      font-size: 0.875rem;
      color: var(--secondary-grey);
      margin: 4px 0 0;
    }

    .report-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: 16px;
      border-top: 1px solid var(--surface-highest);
    }

    .destination-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--secondary-grey);
      background: var(--surface-low);
      padding: 4px 8px;
      border-radius: var(--radius-xs);
    }

    .destination-tag .material-symbols-outlined {
      font-size: 14px;
    }

    .table-actions, .card-actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-grey);
      padding: 4px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      transition: background 0.2s;
    }

    .icon-btn:hover {
      background: var(--surface-container);
      color: var(--primary-red);
    }
  `]
})
export class DashboardsComponent implements OnInit {
  private api = inject(ApiService);
  
  viewMode = signal<'table' | 'card'>('table');
  reports = signal<ReportDefinition[]>([]);

  columns = [
    { key: 'name', label: 'Report Name' },
    { key: 'cubeName', label: 'Data Source' },
    { key: 'format', label: 'Format' },
    { key: 'delivery.destination', label: 'Destination' },
  ];

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.api.getReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (err) => {
        console.error('Error loading reports', err);
        // Fallback for demo if API fails
        this.reports.set([
          { 
            id: '1', 
            name: 'Monthly Sales Analysis', 
            cubeName: 'SalesCube', 
            format: 'xlsx', 
            measures: [], 
            dimensions: [], 
            filters: [],
            delivery: { channel: 'email', destination: 'finance@cgo.com' } 
          },
          { 
            id: '2', 
            name: 'Inventory Snapshot', 
            cubeName: 'WarehouseCube', 
            format: 'csv', 
            measures: [], 
            dimensions: [], 
            filters: [],
            delivery: { channel: 'ftp', destination: '/mnt/reports/inv' } 
          }
        ]);
      }
    });
  }
}
