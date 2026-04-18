import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent, KpiCardComponent, BaseTableComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Metric } from '@cgomanager/shared-data-access';

@Component({
  standalone: true,
  imports: [CommonModule, MetricCardComponent, KpiCardComponent, BaseTableComponent],
  selector: 'app-dashboard-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  metrics: Metric[] = [];

  logColumns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'event', label: 'Event' },
    { key: 'status', label: 'Status' }
  ];

  recentLogs = [
    { timestamp: '2026-04-18 14:22:01', event: 'Satellite SV-92 Orbit Correction', status: 'Active' },
    { timestamp: '2026-04-18 13:45:12', event: 'New Tenant Provisioning: SkyNet', status: 'Active' },
  ];

  ngOnInit() {
    this.api.getMetrics().subscribe(data => this.metrics = data);
  }

  getIcon(label: string): string {
    switch (label) {
      case 'Total Tenants': return '🏢';
      case 'Active Satellites': return '🛰️';
      case 'Platform Uptime': return '🛡️';
      case 'System Alerts': return '⚠️';
      default: return '📊';
    }
  }
}
