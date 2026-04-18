import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <span class="label">{{ label }}</span>
      <div class="value-container">
        <h3 class="value">{{ value }}</h3>
        <span class="trend" [class.up]="trend > 0" *ngIf="trend">
          {{ trend > 0 ? '↑' : '↓' }} {{ trend }}%
        </span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--surface-lowest);
      padding: 24px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-cloud);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05rem;
      color: var(--secondary-grey);
      text-transform: uppercase;
    }
    .value-container {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .value {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      color: var(--inverse-surface);
      letter-spacing: -0.02em;
    }
    .trend {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 99px;
      background: var(--surface-low);
    }
    .trend.up {
      color: #00c853;
      background: #00c8531a;
    }
  `]
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() trend?: number;
}
