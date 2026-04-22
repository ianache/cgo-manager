import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, DataSource } from '@cgomanager/shared-data-access';
import { 
  ButtonComponent, 
  RadioGroupComponent, 
  RadioButtonComponent,
  FormHeaderComponent
} from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-reporting-data-source-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonComponent,
    RadioGroupComponent,
    RadioButtonComponent,
    FormHeaderComponent
  ],
  template: `
    <div class="ds-form-page">
      <cgo-form-header 
        [title]="isEdit() ? 'Edit Data Source' : 'New Data Source'" 
        [description]="isEdit() ? 'Update connection parameters for this source.' : 'Configure a new connector to fetch operational data.'">
      </cgo-form-header>

      <div class="ds-layout">
        <!-- Main Form Section -->
        <main class="ds-main-content">
          <section class="ds-card cloud-shadow" [formGroup]="dsForm">
            <div class="card-header-group">
              <h3 class="card-section-title">Connectivity & Identity</h3>
              <p class="card-section-desc">Define how the reporting engine will identify and connect to this source.</p>
            </div>

            <div class="form-grid">
              <div class="form-section">
                <label class="label-sm">Source Name</label>
                <input type="text" formControlName="name" placeholder="e.g. Production Data Lake" class="cgo-input">
              </div>

              <div class="form-section">
                <label class="label-sm">Connector Type</label>
                <cgo-radio-group formControlName="type" direction="horizontal">
                  <cgo-radio-button value="cube" label="Cube.js"></cgo-radio-button>
                  <cgo-radio-button value="sql" label="SQL Database"></cgo-radio-button>
                  <cgo-radio-button value="api" label="REST API"></cgo-radio-button>
                </cgo-radio-group>
              </div>

              <div class="form-section full-width">
                <label class="label-sm">Connection String / Endpoint URL</label>
                <div class="input-with-icon">
                  <span class="material-symbols-outlined input-icon">link</span>
                  <input type="text" formControlName="connectionString" placeholder="postgresql://user:pass@host:5432/db" class="cgo-input has-icon">
                </div>
              </div>

              <div class="form-section">
                <label class="label-sm">Initial Status</label>
                <select formControlName="status" class="cgo-select">
                  <option value="active">Active (Synchronizing)</option>
                  <option value="inactive">Inactive (Paused)</option>
                </select>
              </div>
            </div>
          </section>

          <div class="ds-form-footer">
            <cgo-button variant="secondary" routerLink="../../data-sources">Discard Changes</cgo-button>
            <div class="footer-right">
              <cgo-button variant="tertiary" (click)="testConnection()" [disabled]="!dsForm.valid">
                <span class="material-symbols-outlined">network_check</span>
                Test Connection
              </cgo-button>
              <cgo-button variant="primary" (click)="save()" [disabled]="!dsForm.valid">
                <span class="material-symbols-outlined">save</span>
                Save
              </cgo-button>
            </div>
          </div>
        </main>

        <!-- Preview/Info Sidebar -->
        <aside class="ds-sidebar">
          <div class="sticky-top">
            <h4 class="label-sm sidebar-title">Connector Insight</h4>
            
            <div class="preview-box cloud-shadow">
              <div class="preview-header">
                <div class="dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="url-bar">reporting.cgo.io/api/v1/sync</div>
              </div>
              <div class="preview-body">
                <div class="type-icon-large" [ngClass]="dsForm.get('type')?.value">
                  <span class="material-symbols-outlined">{{ getIcon(dsForm.get('type')?.value || 'cube') }}</span>
                </div>
                <div class="preview-details">
                  <div class="preview-label">Live Sync Status</div>
                  <div class="preview-value" [class.inactive]="dsForm.get('status')?.value === 'inactive'">
                    {{ dsForm.get('status')?.value === 'active' ? 'Ready to stream' : 'Sync Paused' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="info-alert">
              <span class="material-symbols-outlined">info</span>
              <p>Deployment typically takes less than 60 seconds to propagate to all reporting nodes across the cluster.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .ds-form-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    
    .ds-layout { 
      display: grid; 
      grid-template-columns: 1fr 360px; 
      gap: 32px; 
      max-width: 1200px;
    }

    .ds-main-content { display: flex; flex-direction: column; gap: 32px; }

    .ds-card { 
      background: var(--surface-lowest); 
      border-radius: var(--radius-md); 
      padding: 40px;
      border: 1px solid var(--surface-highest);
    }

    .card-header-group { margin-bottom: 32px; }
    .card-section-title { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--inverse-surface); }
    .card-section-desc { margin: 4px 0 0; font-size: 0.875rem; color: var(--secondary-grey); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .full-width { grid-column: span 2; }
    .form-section { display: flex; flex-direction: column; gap: 8px; }

    .cgo-input, .cgo-select { 
      padding: 12px 16px; 
      border-radius: var(--radius-sm); 
      border: 1px solid var(--surface-highest); 
      background: var(--surface-low); 
      font-family: var(--font-family); 
      font-size: 0.875rem; 
      color: var(--inverse-surface); 
      transition: all 0.2s; 
    }

    .cgo-input:focus, .cgo-select:focus { 
      outline: none; 
      border-color: var(--primary-red); 
      background: var(--surface-lowest);
      box-shadow: 0 0 0 3px rgba(187, 0, 18, 0.05);
    }

    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 12px; font-size: 20px; color: var(--secondary-grey); }
    .cgo-input.has-icon { padding-left: 40px; }

    .ds-form-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--surface-highest); }
    .footer-right { display: flex; gap: 16px; }

    .ds-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .sticky-top { position: sticky; top: 100px; }
    .sidebar-title { margin-bottom: 16px; }

    .preview-box { 
      background: white; 
      border-radius: var(--radius-md); 
      overflow: hidden; 
      border: 1px solid var(--surface-highest);
    }

    .preview-header { 
      background: var(--surface-low); 
      padding: 8px 12px; 
      border-bottom: 1px solid var(--surface-highest);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dots { display: flex; gap: 4px; }
    .dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--surface-highest); }

    .url-bar { 
      background: var(--surface-lowest); 
      font-size: 10px; 
      padding: 2px 12px; 
      border-radius: 100px; 
      color: var(--secondary-grey);
      flex: 1;
      text-align: center;
    }

    .preview-body { 
      padding: 32px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 24px;
      aspect-ratio: 4/3;
      justify-content: center;
    }

    .type-icon-large {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-low);
      transition: all 0.3s;
    }

    .type-icon-large .material-symbols-outlined { font-size: 40px; }
    .type-icon-large.cube { color: #0066ff; background: #e6f0ff; }
    .type-icon-large.sql { color: #ff9900; background: #fff4e6; }
    .type-icon-large.api { color: #00cc66; background: #ebfbee; }

    .preview-details { text-align: center; }
    .preview-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: var(--secondary-grey); letter-spacing: 0.05em; }
    .preview-value { font-size: 14px; font-weight: 700; color: #087f5b; margin-top: 4px; }
    .preview-value.inactive { color: #c92a2a; }

    .info-alert { 
      margin-top: 24px;
      background: rgba(187, 0, 18, 0.03); 
      padding: 16px; 
      border-radius: var(--radius-sm); 
      border: 1px solid rgba(187, 0, 18, 0.1);
      display: flex;
      gap: 12px;
    }

    .info-alert .material-symbols-outlined { color: var(--primary-red); font-size: 20px; }
    .info-alert p { margin: 0; font-size: 11px; line-height: 1.5; color: var(--inverse-surface); opacity: 0.8; }

    .cloud-shadow { box-shadow: var(--shadow-cloud); }
  `]
})
export class DataSourceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  dsId = signal<string | null>(null);
  isEdit = signal(false);

  dsForm = this.fb.group({
    name: ['', Validators.required],
    type: ['cube', Validators.required],
    connectionString: ['', Validators.required],
    status: ['active', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dsId.set(id);
      this.isEdit.set(true);
      this.loadDataSource(id);
    }
  }

  loadDataSource(id: string) {
    this.api.getDataSourceById(id).subscribe({
      next: (ds) => this.dsForm.patchValue(ds),
      error: (err) => console.error('Error loading data source', err)
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

  testConnection() {
    this.router.navigate(['../test-result'], { 
      relativeTo: this.route,
      queryParams: { type: this.dsForm.value.type } 
    });
  }

  save() {
    if (this.dsForm.valid) {
      const ds = this.dsForm.value as DataSource;
      const id = this.dsId();
      const request = id 
        ? this.api.updateDataSource(id, ds) 
        : this.api.createDataSource(ds);

      request.subscribe({
        next: () => {
          alert(id ? 'Data Source actualizada' : 'Data Source creada');
          this.router.navigate(['../../data-sources'], { relativeTo: this.route });
        },
        error: (err) => console.error('Error saving data source', err)
      });
    }
  }
}
