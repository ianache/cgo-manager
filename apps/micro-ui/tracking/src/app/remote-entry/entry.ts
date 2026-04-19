import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormHeaderComponent } from '@cgomanager/shared-ui-kit';

@Component({
  standalone: true,
  imports: [CommonModule, FormHeaderComponent],
  selector: 'app-tracking-entry',
  templateUrl: './entry.component.html',
  styles: [`
    .map-container {
      width: 100%;
      height: calc(100vh - 200px);
      background: #0d1117;
      border-radius: var(--radius-md);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-cloud);
    }
    .satellite-dot {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--primary-red);
      border-radius: 50%;
      box-shadow: 0 0 15px var(--primary-red);
      cursor: pointer;
    }
    .grid-lines {
      width: 100%;
      height: 100%;
      background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 50px 50px;
    }
    .detail-panel {
      position: absolute;
      right: 24px;
      top: 24px;
      width: 300px;
      background: rgba(25, 28, 29, 0.85);
      backdrop-filter: blur(12px);
      color: white;
      padding: 24px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .panel-title { margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 700; }
    .stat-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.875rem; }
    .stat-label { opacity: 0.6; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
  `]
})
export class RemoteEntryComponent {
  selectedSat = { id: 'SV-92', velocity: '27,500 km/h', altitude: '550 km', status: 'Optimal' };
}
