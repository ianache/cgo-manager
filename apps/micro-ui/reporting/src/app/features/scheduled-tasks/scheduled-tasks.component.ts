import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaginatedTableComponent } from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-scheduled-tasks',
  standalone: true,
  imports: [CommonModule, PaginatedTableComponent],
  template: `
    <div class="scheduled-tasks-page">
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">Scheduled Tasks</h2>
          <p class="page-description">Automate report generation and distribution workflows.</p>
        </div>
        <button class="btn-primary" (click)="scheduleNewTask()">
          <span class="material-symbols-outlined">schedule_send</span>
          Schedule New Task
        </button>
      </div>

      <div class="table-card cloud-shadow">
        <cgo-paginated-table 
          [columns]="columns" 
          [data]="tasks" 
          [pageSize]="10"
          [showActions]="true">
          <ng-template #actionsTemplate let-task>
            <div class="actions-group">
              <button class="action-btn"><span class="material-symbols-outlined">play_circle</span></button>
              <button class="action-btn"><span class="material-symbols-outlined">edit</span></button>
              <button class="action-btn"><span class="material-symbols-outlined">delete</span></button>
            </div>
          </ng-template>
        </cgo-paginated-table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    .page-title { font-size: 1.875rem; font-weight: 800; letter-spacing: -0.05em; margin: 0; color: #191c1d; }
    .page-description { margin: 4px 0 0; color: #506169; font-weight: 500; }
    .table-card { background: white; border-radius: 8px; padding: 24px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02); }
    .actions-group { display: flex; gap: 4px; justify-content: center; }
    .action-btn { background: none; border: none; color: #506169; cursor: pointer; padding: 4px; border-radius: 4px; }
    .action-btn:hover { background: #f0f1f2; color: #bb0012; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      background: #bb0012; color: #ffffff; border: none; transition: all 0.2s;
    }
  `]
})
export class ScheduledTasksComponent {
  constructor(private router: Router) {}

  scheduleNewTask(): void {
    this.router.navigate(['/reporting/scheduled-tasks/create']);
  }

  columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' | 'checkbox' | 'custom' }[] = [
    { key: 'name', label: 'TASK NAME' },
    { key: 'frequency', label: 'FREQUENCY' },
    { key: 'recipients', label: 'RECIPIENTS' },
    { key: 'lastRun', label: 'LAST RUN' },
    { key: 'status', label: 'STATUS', type: 'badges' }
  ];

  tasks = [
    { id: 1, name: 'Daily Fleet Report', frequency: 'Every day at 08:00', recipients: 'Admin Team', lastRun: 'Today 08:00', status: 'Active' },
    { id: 2, name: 'Monthly Billing Audit', frequency: '1st of every month', recipients: 'Finance Dept', lastRun: 'Apr 1, 00:00', status: 'Active' },
    { id: 3, name: 'Critical Incident Alert', frequency: 'Real-time', recipients: 'Operations Manager', lastRun: '2m ago', status: 'Paused' },
  ];
}
