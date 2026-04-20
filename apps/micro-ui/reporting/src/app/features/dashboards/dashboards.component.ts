import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reporting-dashboards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboards-page">
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">Reporting Dashboards</h2>
          <p class="page-description">Visualize your operational data through high-level telemetry views.</p>
        </div>
        <button class="btn-primary" routerLink="../builder">
          <span class="material-symbols-outlined">add_chart</span>
          Create New Dashboard
        </button>
      </div>

      <div class="dashboard-grid">
        @for (dash of dashboards; track dash.id) {
          <div class="dashboard-card cloud-shadow">
            <div class="card-thumb">
              <span class="material-symbols-outlined dash-icon">{{ dash.icon }}</span>
            </div>
            <div class="card-body">
              <h4 class="dash-name">{{ dash.name }}</h4>
              <p class="dash-meta">Last updated: {{ dash.lastUpdate }}</p>
            </div>
            <div class="card-actions">
              <button class="action-btn"><span class="material-symbols-outlined">visibility</span></button>
              <button class="action-btn"><span class="material-symbols-outlined">edit</span></button>
              <button class="action-btn"><span class="material-symbols-outlined">share</span></button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    .page-title { font-size: 1.875rem; font-weight: 800; letter-spacing: -0.05em; margin: 0; color: #191c1d; }
    .page-description { margin: 4px 0 0; color: #506169; font-weight: 500; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .dashboard-card { background: white; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; }
    .dashboard-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(25,28,29,0.08); }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02); }
    .card-thumb { height: 120px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #bb0012; }
    .dash-icon { font-size: 48px; opacity: 0.8; }
    .card-body { padding: 20px; border-bottom: 1px solid #edeeef; }
    .dash-name { margin: 0; font-size: 1rem; font-weight: 800; text-transform: uppercase; color: #191c1d; }
    .dash-meta { margin: 4px 0 0; font-size: 0.75rem; color: #506169; font-weight: 500; }
    .card-actions { padding: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .action-btn { background: none; border: none; cursor: pointer; color: #506169; padding: 4px; border-radius: 4px; }
    .action-btn:hover { background: #f0f1f2; color: #bb0012; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      background: #bb0012; color: #ffffff; border: none; transition: all 0.2s;
    }
  `]
})
export class DashboardsComponent {
  dashboards = [
    { id: 1, name: 'Fleet Telemetry', icon: 'satellite_alt', lastUpdate: '2h ago' },
    { id: 2, name: 'Tenant Usage', icon: 'corporate_fare', lastUpdate: '5h ago' },
    { id: 3, name: 'Network Health', icon: 'lan', lastUpdate: '1d ago' },
  ];
}
