import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaginatedTableComponent, 
  GenericCardComponent, 
  ButtonComponent 
} from '@cgomanager/shared-ui-kit';
import { ApiService, DataSource } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-reporting-data-sources',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PaginatedTableComponent, 
    GenericCardComponent,
    ButtonComponent
  ],
  template: `
    <div class="datasources-page">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">Data Sources</h2>
          <p class="page-description">Manage connections to external data lakes, databases, and semantic cubes.</p>
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
            routerLink="create">
            <span class="material-symbols-outlined">add_link</span>
            New Data Source
          </cgo-button>
        </div>
      </div>

      <div class="content-area">
        <ng-container *ngIf="viewMode() === 'table'">
          <cgo-paginated-table
            [columns]="columns"
            [data]="dataSources()"
            [pageSize]="10"
            [showActions]="true"
            [showHeader]="true"
            [showHeaderSearch]="true"
            headerTitle="Connected Data Sources"
            headerDescription="Browse all available connectors and their synchronization status.">
            <ng-template #actionsTemplate let-ds>
              <div class="table-actions">
                <button class="icon-btn" title="Edit" [routerLink]="['edit', ds.id]"><span class="material-symbols-outlined">edit</span></button>
                <button class="icon-btn" title="Sync"><span class="material-symbols-outlined">sync</span></button>
                <button class="icon-btn" title="Delete"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </ng-template>
          </cgo-paginated-table>
        </ng-container>

        <ng-container *ngIf="viewMode() === 'card'">
          <div class="datasource-grid">
            @for (ds of dataSources(); track ds.id) {
              <cgo-generic-card [clickable]="true">
                <div card-image class="ds-card-icon" [ngClass]="ds.type">
                  <span class="material-symbols-outlined">{{ getIcon(ds.type) }}</span>
                </div>
                <div class="ds-status-badge" [class]="ds.status">{{ ds.status }}</div>
                <h4 card-title class="ds-name">{{ ds.name }}</h4>
                <p card-subtitle class="ds-meta">Type: {{ ds.type | uppercase }}</p>
                
                <div class="ds-card-footer" card-footer>
                  <span class="sync-tag">
                    <span class="material-symbols-outlined">update</span>
                    {{ ds.lastSync || 'Never synced' }}
                  </span>
                  <div class="card-actions">
                    <button class="icon-btn" [routerLink]="['edit', ds.id]"><span class="material-symbols-outlined">edit</span></button>
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
    .datasources-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .page-title { font-size: 2rem; font-weight: 700; margin: 0; color: var(--inverse-surface); }
    .page-description { margin: 8px 0 0; color: var(--secondary-grey); font-weight: 500; }
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .view-toggle { display: flex; background: var(--surface-lowest); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--surface-highest); }
    .toggle-btn { background: none; border: none; padding: 8px; border-radius: var(--radius-sm); cursor: pointer; color: var(--secondary-grey); display: flex; align-items: center; transition: all 0.2s; }
    .toggle-btn.active { background: var(--surface-container); color: var(--primary-red); }
    .cloud-shadow { box-shadow: var(--shadow-cloud); }
    .content-area { flex: 1; }
    .datasource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .ds-card-icon { height: 120px; background: var(--surface-low); display: flex; align-items: center; justify-content: center; }
    .ds-card-icon.cube { color: #0066ff; }
    .ds-card-icon.sql { color: #ff9900; }
    .ds-card-icon.api { color: #00cc66; }
    .ds-card-icon .material-symbols-outlined { font-size: 48px; }
    .ds-status-badge { position: absolute; top: 12px; right: 12px; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 100px; border: 1px solid currentColor; }
    .ds-status-badge.active { background: #e6fcf5; color: #087f5b; }
    .ds-status-badge.inactive { background: #fff5f5; color: #c92a2a; }
    .ds-name { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--inverse-surface); }
    .ds-meta { font-size: 0.875rem; color: var(--secondary-grey); margin: 4px 0 0; }
    .ds-card-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 16px; border-top: 1px solid var(--surface-highest); }
    .sync-tag { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; color: var(--secondary-grey); }
    .sync-tag .material-symbols-outlined { font-size: 14px; }
    .table-actions, .card-actions { display: flex; gap: 8px; }
    .icon-btn { background: none; border: none; cursor: pointer; color: var(--secondary-grey); padding: 4px; border-radius: var(--radius-sm); display: flex; align-items: center; transition: background 0.2s; }
    .icon-btn:hover { background: var(--surface-container); color: var(--primary-red); }
  `]
})
export class DataSourcesComponent implements OnInit {
  private api = inject(ApiService);
  
  viewMode = signal<'table' | 'card'>('table');
  dataSources = signal<DataSource[]>([]);

  columns = [
    { key: 'name', label: 'Source Name' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'lastSync', label: 'Last Sync' },
  ];

  ngOnInit() {
    this.loadDataSources();
  }

  loadDataSources() {
    this.api.getDataSources().subscribe({
      next: (data) => this.dataSources.set(data),
      error: (err) => {
        console.error('Error loading data sources', err);
        // Fallback for demo
        this.dataSources.set([
          { id: '1', name: 'Main Fleet DB', type: 'sql', status: 'active', lastSync: '10m ago' },
          { id: '2', name: 'Cube Semantic Layer', type: 'cube', status: 'active', lastSync: '1h ago' },
          { id: '3', name: 'External Weather API', type: 'api', status: 'inactive', lastSync: '2d ago' },
        ]);
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'cube': return 'database_schema';
      case 'sql': return 'database';
      case 'api': return 'api';
      default: return 'link';
    }
  }
}
