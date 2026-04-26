import { Component, ViewChild, TemplateRef, AfterViewInit, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, ScheduledTask } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-scheduled-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatedTableComponent, FormHeaderComponent, ButtonComponent],
  template: `
    <div class="tasks-page">
      <cgo-form-header
        title="Scheduled Automations"
        description="Monitor and manage recurring report generation tasks. Track execution schedules and delivery health.">
        <div actions>
          <cgo-button variant="primary" routerLink="../scheduled-tasks/create">
            <span class="material-symbols-outlined">add_task</span>
            Schedule New Task
          </cgo-button>
        </div>
      </cgo-form-header>

      <div class="table-card cloud-shadow">
        <cgo-paginated-table
          [columns]="columns"
          [data]="tasks()"
          [pageSize]="10"
          [showActions]="true"
          [customTemplates]="customTemplates">
          
          <ng-template #statusCellTpl let-value>
            <span class="status-pill" [ngClass]="'status-' + value.toLowerCase()">
              {{ value }}
            </span>
          </ng-template>

          <ng-template #enabledCellTpl let-value>
            <span class="status-pill" [ngClass]="value ? 'status-active' : 'status-inactive'">
              {{ value ? 'Enabled' : 'Paused' }}
            </span>
          </ng-template>

          <ng-template #actionsTemplate let-task>
            <div class="table-actions">
              <button class="icon-btn" title="Edit" [routerLink]="['../scheduled-tasks', task.id, 'edit']">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="icon-btn" title="Execute Now">
                <span class="material-symbols-outlined">play_circle</span>
              </button>
              <button class="icon-btn" title="Delete" (click)="deleteTask(task.id)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </ng-template>
        </cgo-paginated-table>
      </div>
    </div>
  `,
  styles: [`
    .tasks-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    .table-card { background: white; border-radius: 8px; overflow: hidden; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }
    
    .status-pill { padding: 4px 12px; border-radius: 999px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; }
    .status-active { background: #e8f5e9; color: #1b5e20; }
    .status-inactive { background: #f5f5f5; color: #757575; }
    .status-pending { background: #fff8e1; color: #e65100; }
    .status-running { background: #e3f2fd; color: #1565c0; }
    
    .table-actions { display: flex; gap: 8px; justify-content: center; }
    .icon-btn { background: none; border: none; padding: 6px; border-radius: 4px; color: #506169; cursor: pointer; transition: all 0.2s; }
    .icon-btn:hover { background: #f1f3f4; color: #bb0012; }
  `]
})
export class ScheduledTasksComponent implements OnInit, AfterViewInit {
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;
  @ViewChild('enabledCellTpl') enabledCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  
  tasks = signal<ScheduledTask[]>([]);
  columns: PaginatedTableColumn[] = [
    { key: 'reportName', label: 'Report' },
    { key: 'cron', label: 'Schedule (CRON)' },
    { key: 'enabled', label: 'Status', type: 'custom' },
    { key: 'status', label: 'Last Run Result', type: 'custom' }
  ];
  customTemplates: any = {};

  ngOnInit() {
    this.loadTasks();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        status: this.statusCellTpl,
        enabled: this.enabledCellTpl
      };
    });
  }

  loadTasks() {
    this.api.getScheduledTasks().subscribe({
      next: (data) => this.tasks.set(data),
      error: (err) => console.error('Error loading tasks', err)
    });
  }

  deleteTask(id: string) {
    if (confirm('Delete this scheduled task?')) {
      this.api.deleteScheduledTask(id).subscribe(() => this.loadTasks());
    }
  }
}
