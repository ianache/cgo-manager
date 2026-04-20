import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RadioGroupComponent, RadioButtonComponent } from '@cgomanager/shared-ui-kit';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, RadioGroupComponent, RadioButtonComponent, FormsModule],
  template: `
    <div class="builder-page">
      <div class="navigation">
        <button class="btn-back" routerLink="../dashboards">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Dashboards
        </button>
      </div>

      <div class="builder-layout">
        <!-- Sidebar: Configuration -->
        <aside class="builder-sidebar cloud-shadow">
          <h3 class="sidebar-title">Dashboard Config</h3>
          
          <div class="config-section">
            <label>Visualization Type</label>
            <cgo-radio-group [(ngModel)]="vizType" direction="vertical">
              <cgo-radio-button value="bar" label="Bar Chart"></cgo-radio-button>
              <cgo-radio-button value="line" label="Line Graph"></cgo-radio-button>
              <cgo-radio-button value="pie" label="Pie Distribution"></cgo-radio-button>
              <cgo-radio-button value="metric" label="KPI Metric"></cgo-radio-button>
            </cgo-radio-group>
          </div>

          <div class="config-section">
            <label>Data Source</label>
            <select class="builder-select">
              <option>Satellite Telemetry</option>
              <option>Tenant Billing</option>
              <option>System Performance</option>
            </select>
          </div>

          <div class="config-section">
            <label>Refresh Rate</label>
            <cgo-radio-group [(ngModel)]="refresh" direction="vertical">
              <cgo-radio-button value="live" label="Real-time (Stream)"></cgo-radio-button>
              <cgo-radio-button value="5m" label="Every 5 Minutes"></cgo-radio-button>
              <cgo-radio-button value="1h" label="Hourly Snapshot"></cgo-radio-button>
            </cgo-radio-group>
          </div>

          <button class="btn-primary full-width">Add Widget</button>
        </aside>

        <!-- Main Canvas: Visual Preview -->
        <main class="builder-canvas">
          <div class="canvas-header">
            <input type="text" class="dash-title-input" placeholder="Untitled Dashboard">
            <div class="canvas-actions">
              <button class="btn-tertiary">Preview</button>
              <button class="btn-primary">Save Dashboard</button>
            </div>
          </div>

          <div class="preview-area">
            <div class="empty-preview">
              <span class="material-symbols-outlined preview-icon">dashboard_customize</span>
              <p>Drag and drop widgets here or use the configuration panel to start building your dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .builder-page { height: 100%; display: flex; flex-direction: column; }
    .navigation { margin-bottom: 24px; }
    .btn-back {
      display: flex; align-items: center; gap: 8px;
      background: none; border: none; color: #506169;
      cursor: pointer; font-weight: 700; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.1em;
    }
    .builder-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; flex: 1; }
    .builder-sidebar { background: white; border-radius: 8px; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02); }
    .sidebar-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #191c1d; border-bottom: 2px solid #f8f9fa; padding-bottom: 12px; margin: 0; }
    .config-section { display: flex; flex-direction: column; gap: 12px; }
    .config-section label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #506169; }
    .builder-select { padding: 10px; background: #f8f9fa; border: 1px solid #e1e3e4; border-radius: 4px; font-size: 0.8125rem; font-weight: 500; }
    .builder-canvas { display: flex; flex-direction: column; gap: 24px; }
    .canvas-header { display: flex; justify-content: space-between; align-items: center; }
    .dash-title-input { background: transparent; border: none; border-bottom: 2px solid #e1e3e4; font-size: 1.5rem; font-weight: 800; color: #191c1d; padding: 8px 0; outline: none; width: 400px; }
    .dash-title-input:focus { border-color: #bb0012; }
    .canvas-actions { display: flex; gap: 12px; }
    .preview-area { flex: 1; background: #f3f4f5; border: 2px dashed #e1e3e4; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .empty-preview { text-align: center; color: #b8c9d3; max-width: 400px; }
    .preview-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
    .full-width { width: 100%; }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      background: #bb0012; color: #ffffff; border: none;
    }
    .btn-tertiary {
      background: transparent; color: #191c1d; border: 1px solid #e1e3e4;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
    }
  `]
})
export class ReportBuilderComponent {
  vizType = 'bar';
  refresh = '5m';
}
