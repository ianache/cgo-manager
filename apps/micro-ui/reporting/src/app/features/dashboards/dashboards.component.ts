import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaginatedTableComponent, 
  GenericCardComponent, 
  ButtonComponent, 
  KpiCardComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, ReportDefinition } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PaginatedTableComponent, 
    GenericCardComponent, 
    ButtonComponent, 
    KpiCardComponent
  ],
  template: `
    <div class="dashboard-page">
      <header class="page-header">
        <div class="title-block">
          <h2 class="page-title">Executive Reporting</h2>
          <p class="page-subtitle">Analyze metrics, operational efficiency and fleet health.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button class="toggle-btn" [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')">
              <span class="material-symbols-outlined">table_chart</span>
            </button>
            <button class="toggle-btn" [class.active]="viewMode() === 'card'" (click)="viewMode.set('card')">
              <span class="material-symbols-outlined">grid_view</span>
            </button>
          </div>
          <cgo-button variant="primary" routerLink="../designer">
            <span class="material-symbols-outlined">add_chart</span>
            NEW REPORT
          </cgo-button>
        </div>
      </header>

      <section class="kpi-grid">
        <cgo-kpi-card title="Total Reports" [value]="128" [trend]="12" icon="description"></cgo-kpi-card>
        <cgo-kpi-card title="Scheduled Tasks" [value]="14" [trend]="5" icon="schedule"></cgo-kpi-card>
        <cgo-kpi-card title="Data Sources" [value]="6" [trend]="0" icon="database"></cgo-kpi-card>
        <cgo-kpi-card title="Active Users" [value]="342" [trend]="-2" icon="group"></cgo-kpi-card>
      </section>

      <!-- Main Content Area -->
      <main class="content-body cloud-shadow">
        <ng-container *ngIf="viewMode() === 'table'">
          <cgo-paginated-table
            [columns]="columns"
            [data]="reports()"
            [pageSize]="10"
            [showActions]="true">
            
            <ng-template #actionsTemplate let-report>
              <div class="table-actions">
                <button class="icon-btn" title="Visual Designer" [routerLink]="['../visual-designer', report.id]"><span class="material-symbols-outlined">palette</span></button>
                <button class="icon-btn" title="Edit Wizard" [routerLink]="['../designer', report.id]"><span class="material-symbols-outlined">edit</span></button>
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
                <p card-subtitle class="report-meta">Cube: {{ report.cube_name }} | Format: {{ report.format }}</p>
                
                <div class="report-card-footer" card-footer>
                  <span class="destination-tag">
                    <span class="material-symbols-outlined">send</span>
                    {{ report.delivery_json?.destination || '-' }}
                  </span>
                  <div class="card-actions">
                    <button class="icon-btn" title="Visual Designer" [routerLink]="['../visual-designer', report.id]"><span class="material-symbols-outlined">palette</span></button>
                    <button class="icon-btn" title="Edit Wizard" [routerLink]="['../designer', report.id]"><span class="material-symbols-outlined">edit</span></button>
                    <button class="icon-btn"><span class="material-symbols-outlined">more_vert</span></button>
                  </div>
                </div>
              </cgo-generic-card>
            }
          </div>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.04em; color: #191c1d; }
    .page-subtitle { margin: 4px 0 0; color: #506169; font-weight: 500; }
    
    .header-actions { display: flex; align-items: center; gap: 24px; }
    .view-toggle { display: flex; background: #edeeef; padding: 4px; border-radius: 8px; }
    .toggle-btn { border: none; background: none; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 6px; color: #506169; transition: all 0.2s; }
    .toggle-btn.active { background: white; color: #bb0012; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    
    .content-body { background: white; border-radius: 8px; overflow: hidden; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }
    
    .report-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; padding: 24px; }
    .report-card-icon { height: 120px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #b8c9d3; }
    .report-card-icon .material-symbols-outlined { font-size: 48px; }
    
    .report-name { font-size: 1.125rem; font-weight: 700; margin: 16px 0 4px 0; color: #191c1d; }
    .report-meta { font-size: 0.8125rem; color: #506169; font-weight: 600; margin: 0; }
    
    .report-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f3f4; }
    .destination-tag { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #1565c0; background: #e3f2fd; padding: 4px 10px; border-radius: 4px; font-weight: 700; }
    .destination-tag .material-symbols-outlined { font-size: 14px; }
    
    .card-actions { display: flex; gap: 8px; }
    .table-actions { display: flex; gap: 8px; justify-content: center; }
    .icon-btn { background: none; border: none; padding: 6px; border-radius: 4px; color: #506169; cursor: pointer; transition: all 0.2s; }
    .icon-btn:hover { background: #f1f3f4; color: #bb0012; }
  `]
})
export class DashboardsComponent implements OnInit {
  private api = inject(ApiService);
  
  viewMode = signal<'table' | 'card'>('card');
  reports = signal<ReportDefinition[]>([]);
  
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'Report Name' },
    { key: 'cube_name', label: 'Cube Source' },
    { key: 'format', label: 'Format' },
    { key: 'created_at', label: 'Created At' }
  ];

  ngOnInit() {
    this.api.getReports().subscribe({
      next: (data) => this.reports.set(data),
      error: () => {
        // Fallback mock data if API fails during transition
        this.reports.set([
          { 
            id: '1', 
            name: 'Fleet Performance Q1', 
            cube_name: 'SalesCube', 
            format: 'xlsx', 
            measures: [], 
            dimensions: [], 
            filters: [],
            delivery_json: { channel: 'email', destination: 'admin@comsatel.com.pe' } 
          },
          { 
            id: '2', 
            name: 'Inventory Levels - Lima', 
            cube_name: 'WarehouseCube', 
            format: 'csv', 
            measures: [], 
            dimensions: [], 
            filters: [],
            delivery_json: { channel: 'ftp', destination: '/mnt/reports/inv' } 
          }
        ]);
      }
    });
  }
}
