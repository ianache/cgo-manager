import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-reporting-data-source-test-result',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="result-page">
      <div class="result-card cloud-shadow">
        <div class="success-icon-wrapper">
          <div class="success-pulse"></div>
          <span class="material-symbols-outlined success-check">check_circle</span>
        </div>

        <h2 class="result-title">Connection Verified</h2>
        <p class="result-desc">The reporting engine successfully established a handshake with the remote data source.</p>

        <div class="technical-summary">
          <div class="summary-item">
            <span class="label">Response Time</span>
            <span class="value success">245ms</span>
          </div>
          <div class="summary-item">
            <span class="label">Throughput</span>
            <span class="value">4.2 GB/s</span>
          </div>
          <div class="summary-item">
            <span class="label">Protocol</span>
            <span class="value uppercase">{{ type() }} v2.4</span>
          </div>
        </div>

        <div class="capabilities-grid">
          <div class="cap-item">
            <span class="material-symbols-outlined cap-icon">task_alt</span>
            <span class="cap-text">Metadata Discovery</span>
          </div>
          <div class="cap-item">
            <span class="material-symbols-outlined cap-icon">task_alt</span>
            <span class="cap-text">Real-time Streaming</span>
          </div>
          <div class="cap-item">
            <span class="material-symbols-outlined cap-icon">task_alt</span>
            <span class="cap-text">Batch Exports</span>
          </div>
          <div class="cap-item">
            <span class="material-symbols-outlined cap-icon">task_alt</span>
            <span class="cap-text">Cube Pre-aggregation</span>
          </div>
        </div>

        <div class="result-actions">
          <cgo-button variant="secondary" (click)="goBack()">
            <span class="material-symbols-outlined">arrow_back</span>
            Back to Config
          </cgo-button>
          <cgo-button variant="primary" (click)="saveAndContinue()">
            <span class="material-symbols-outlined">save</span>
            Save & Close
          </cgo-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-page {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--surface-low);
    }

    .result-card {
      background: var(--surface-lowest);
      border-radius: var(--radius-lg);
      padding: 64px;
      max-width: 640px;
      width: 100%;
      text-align: center;
      border: 1px solid var(--surface-highest);
      animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .success-icon-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success-check {
      font-size: 80px;
      color: #087f5b;
      position: relative;
      z-index: 2;
    }

    .success-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #e6fcf5;
      border-radius: 50%;
      z-index: 1;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      70% { transform: scale(1.5); opacity: 0; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    .result-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--inverse-surface);
      letter-spacing: -0.02em;
      margin: 0 0 16px;
    }

    .result-desc {
      font-size: 1rem;
      color: var(--secondary-grey);
      line-height: 1.6;
      margin-bottom: 48px;
    }

    .technical-summary {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 48px;
      padding: 24px;
      background: var(--surface-low);
      border-radius: var(--radius-md);
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-item .label {
      font-size: 0.625rem;
      text-transform: uppercase;
      font-weight: 800;
      color: var(--secondary-grey);
      letter-spacing: 0.08em;
    }

    .summary-item .value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--inverse-surface);
    }

    .summary-item .value.success { color: #087f5b; }

    .capabilities-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 56px;
      text-align: left;
    }

    .cap-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--surface-lowest);
      border: 1px solid var(--surface-highest);
      border-radius: var(--radius-sm);
    }

    .cap-icon {
      font-size: 18px;
      color: #087f5b;
    }

    .cap-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--inverse-surface);
    }

    .result-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .cloud-shadow { box-shadow: var(--shadow-cloud); }
    .uppercase { text-transform: uppercase; }
  `]
})
export class DataSourceTestResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  type = signal('cube');

  ngOnInit() {
    this.type.set(this.route.snapshot.queryParamMap.get('type') || 'cube');
  }

  goBack() {
    window.history.back();
  }

  saveAndContinue() {
    // In a real app we might trigger a save here or just navigate back
    this.router.navigate(['../../data-sources'], { relativeTo: this.route });
  }
}
