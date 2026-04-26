import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, ScheduledTask, ToastService } from '@cgomanager/shared-data-access';
import { 
  ButtonComponent, 
  FormHeaderComponent,
  CheckboxComponent
} from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-schedule-task-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule,
    ButtonComponent,
    FormHeaderComponent,
    CheckboxComponent
  ],
  template: `
    <div class="schedule-form-page">
      <cgo-form-header 
        [title]="isEdit() ? 'Edit Automation' : 'Schedule New Task'" 
        description="Configure automated report generation and delivery. Set up recurrence patterns and destination parameters.">
      </cgo-form-header>

      <div class="form-container cloud-shadow">
        <form [formGroup]="taskForm">
          <div class="form-grid">
            <!-- Report Selection -->
            <div class="form-field">
              <label>Select Report</label>
              <select formControlName="report_id">
                <option value="" disabled>Choose a report...</option>
                <option *ngFor="let report of reports()" [value]="report.id">
                  {{ report.name }}
                </option>
              </select>
            </div>

            <!-- Recurrence -->
            <div class="form-field">
              <label>Recurrence Pattern (CRON)</label>
              <div class="cron-input-group">
                <input type="text" formControlName="cron" placeholder="0 0 1 * *">
                <button class="cron-helper-btn">
                   <span class="material-symbols-outlined">schedule</span>
                </button>
              </div>
              <span class="field-hint">Format: min hour day month weekday</span>
            </div>

            <!-- Status Toggle -->
            <div class="form-field">
               <label>Automation Status</label>
               <div class="status-selector">
                  <label class="radio-option">
                    <input type="radio" formControlName="enabled" [value]="true">
                    <span class="label-text">Enabled</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" formControlName="enabled" [value]="false">
                    <span class="label-text">Paused</span>
                  </label>
               </div>
            </div>

             <div class="form-field">
               <label>Execution Priority</label>
               <select>
                  <option>Standard</option>
                  <option>High (Real-time)</option>
                  <option>Batch (Nightly)</option>
               </select>
            </div>
          </div>

          <div class="form-actions">
            <cgo-button variant="secondary" (click)="cancel()">
              <span class="material-symbols-outlined">close</span>
              Cancel
            </cgo-button>
            <cgo-button variant="primary" (click)="deploy()" [disabled]="!taskForm.valid">
              <span class="material-symbols-outlined">rocket_launch</span>
              {{ isEdit() ? 'Update Automation' : 'Deploy Configuration' }}
            </cgo-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .schedule-form-page { padding: 32px; max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .form-container { background: white; border-radius: 8px; padding: 40px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .full-width { grid-column: span 2; }
    
    .form-field { display: flex; flex-direction: column; gap: 8px; }
    .form-field label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--secondary-grey); }
    
    .form-field input, .form-field select {
      padding: 12px 16px;
      background: var(--surface-light);
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
    }
    .form-field input:focus, .form-field select:focus { border-color: #bb0012; background: white; }

    .cron-input-group { display: flex; gap: 8px; }
    .cron-input-group input { flex: 1; }
    .cron-helper-btn { width: 44px; background: #edeeef; border: none; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #506169; }

    .status-selector { display: flex; gap: 24px; padding: 12px 0; }
    .radio-option { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600; }
    
    .form-actions { margin-top: 48px; padding-top: 32px; border-top: 1px solid #edeeef; display: flex; justify-content: flex-end; gap: 16px; }

    .field-hint { font-size: 0.75rem; color: #b8c9d3; }
  `]
})
export class ScheduleTaskFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  taskForm: FormGroup;
  isEdit = signal(false);
  taskId = signal<string | null>(null);
  reports = signal<any[]>([]);

  constructor() {
    this.taskForm = this.fb.group({
      report_id: ['', Validators.required],
      cron: ['', Validators.required],
      enabled: [true, Validators.required]
    });
  }

  ngOnInit() {
    this.loadReports();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId.set(id);
      this.isEdit.set(true);
      this.loadTask(id);
    }
  }

  loadReports() {
    this.api.getReports().subscribe(data => this.reports.set(data));
  }

  loadTask(id: string) {
    this.api.getScheduledTaskById(id).subscribe(task => {
      this.taskForm.patchValue({
        report_id: task.report_id,
        cron: task.cron,
        enabled: task.enabled
      });
    });
  }

  deploy() {
    if (this.taskForm.valid) {
      const data = this.taskForm.value;
      const id = this.taskId();
      
      const request = id 
        ? this.api.updateScheduledTask(id, data) 
        : this.api.createScheduledTask(data);

      request.subscribe({
        next: () => {
          this.toast.success(this.isEdit() ? 'Tarea actualizada con éxito' : 'Tarea programada con éxito');
          this.router.navigate(['/reporting/scheduled-tasks']);
        },
        error: (err) => {
          console.error('Error saving task', err);
          this.toast.error('Error al guardar la tarea programada');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/reporting/scheduled-tasks']);
  }
}
