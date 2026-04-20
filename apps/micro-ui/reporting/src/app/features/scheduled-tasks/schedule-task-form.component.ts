import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormHeaderComponent } from '@cgomanager/shared-ui-kit';

type Frequency = 'daily' | 'weekly' | 'specific' | 'cron';
type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

@Component({
  selector: 'app-schedule-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormHeaderComponent],
  template: `
    <!-- breadcrumb in header actions slot -->
    <cgo-form-header
      title="Automation & Distribution Setup"
      description="Configure precision scheduling and multi-channel delivery for your satellite data reports.">
      <nav actions class="breadcrumb">
        <span class="bc-link" (click)="cancel()">Scheduled Tasks</span>
        <span class="material-symbols-outlined bc-sep">chevron_right</span>
        <span class="bc-current">New Task</span>
      </nav>
    </cgo-form-header>

    <form class="schedule-form" (ngSubmit)="deploy()">

      <!-- ── Section 1: Task Identity ───────────────────── -->
      <section class="form-section cloud-shadow">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon">assignment</span>
          <div>
            <h3 class="section-title">Task Identity</h3>
            <p class="section-desc">Name this task and choose the report type to distribute.</p>
          </div>
        </div>
        <div class="fields-grid">
          <div class="field-group">
            <label class="field-label" for="taskName">
              Task Name <span class="required">*</span>
            </label>
            <input id="taskName" type="text" class="field-input"
              [class.error]="nameError()"
              [(ngModel)]="taskName" name="taskName"
              placeholder="e.g. Daily Fleet Summary" />
            @if (nameError()) {
              <span class="field-error">
                <span class="material-symbols-outlined">error</span>
                Task name is required.
              </span>
            }
          </div>
          <div class="field-group">
            <label class="field-label" for="reportType">Report Type</label>
            <select id="reportType" class="field-input field-select"
              [(ngModel)]="reportType" name="reportType">
              <option value="fleet">Fleet Summary</option>
              <option value="audit">Audit Log</option>
              <option value="billing">Billing Report</option>
              <option value="incident">Incident Report</option>
              <option value="telemetry">Satellite Telemetry</option>
            </select>
          </div>
        </div>
      </section>

      <!-- ── Section 2: Task Scheduling ────────────────── -->
      <section class="form-section cloud-shadow">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon">schedule</span>
          <div>
            <h3 class="section-title">Task Scheduling</h3>
            <p class="section-desc">Define when this task runs automatically.</p>
          </div>
          <span class="status-badge">
            <span class="material-symbols-outlined">radio_button_checked</span>
            {{ frequency() === 'cron' ? 'CRON Scheduled' : 'Auto Scheduled' }}
          </span>
        </div>

        <!-- Frequency pills -->
        <div class="freq-pills">
          @for (opt of freqOptions; track opt.value) {
            <button type="button" class="freq-pill"
              [class.active]="frequency() === opt.value"
              (click)="frequency.set(opt.value)">
              <span class="material-symbols-outlined">{{ opt.icon }}</span>
              {{ opt.label }}
            </button>
          }
        </div>

        <!-- Daily -->
        @if (frequency() === 'daily') {
          <div class="freq-config">
            <div class="field-group half">
              <label class="field-label">Time</label>
              <input type="time" class="field-input" [(ngModel)]="dailyTime" name="dailyTime" />
            </div>
            <p class="freq-preview">
              <span class="material-symbols-outlined">info</span>
              Runs every day at {{ formatTime(dailyTime) }}
            </p>
          </div>
        }

        <!-- Weekly -->
        @if (frequency() === 'weekly') {
          <div class="freq-config">
            <label class="field-label">Days of week</label>
            <div class="day-pills">
              @for (day of weekDays; track day) {
                <button type="button" class="day-pill"
                  [class.active]="selectedDays().includes(day)"
                  (click)="toggleDay(day)">{{ day }}</button>
              }
            </div>
            <div class="field-group half" style="margin-top:16px">
              <label class="field-label">Time</label>
              <input type="time" class="field-input" [(ngModel)]="weeklyTime" name="weeklyTime" />
            </div>
          </div>
        }

        <!-- Specific date -->
        @if (frequency() === 'specific') {
          <div class="freq-config fields-grid">
            <div class="field-group">
              <label class="field-label">Date</label>
              <input type="date" class="field-input" [(ngModel)]="specificDate" name="specificDate" />
            </div>
            <div class="field-group">
              <label class="field-label">Time</label>
              <input type="time" class="field-input" [(ngModel)]="specificTime" name="specificTime" />
            </div>
          </div>
        }

        <!-- CRON -->
        @if (frequency() === 'cron') {
          <div class="freq-config">
            <div class="field-group">
              <label class="field-label">CRON Expression</label>
              <input type="text" class="field-input mono"
                [(ngModel)]="cronExpr" name="cronExpr"
                placeholder="0 8 * * 1-5" />
              <span class="field-hint">Standard CRON format: minute hour day month weekday</span>
            </div>
          </div>
        }

        <div class="load-badge">
          <span class="material-symbols-outlined">bolt</span>
          Optimized Priority
        </div>
      </section>

      <!-- ── Section 3: Distribution Channels ──────────── -->
      <section class="form-section cloud-shadow">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon">hub</span>
          <div>
            <h3 class="section-title">Distribution Channels</h3>
            <p class="section-desc">Select and configure where reports are delivered.</p>
          </div>
          @if (activeChannelCount() > 0) {
            <span class="status-badge active">
              <span class="material-symbols-outlined">check_circle</span>
              {{ activeChannelCount() }} Channel{{ activeChannelCount() > 1 ? 's' : '' }} Active
            </span>
          }
        </div>

        <div class="channels-list">

          <!-- Email -->
          <div class="channel-card" [class.enabled]="emailEnabled">
            <div class="channel-header" (click)="emailEnabled = !emailEnabled">
              <div class="channel-identity">
                <div class="channel-icon-bg">
                  <span class="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <span class="channel-name">Email</span>
                  <span class="channel-type">Direct Delivery</span>
                </div>
              </div>
              <div class="toggle-switch" [class.on]="emailEnabled">
                <div class="toggle-knob"></div>
              </div>
            </div>
            @if (emailEnabled) {
              <div class="channel-body">
                <label class="field-label">Recipient List</label>
                <div class="tag-input-wrapper">
                  <div class="tags">
                    @for (tag of emailRecipients; track tag) {
                      <span class="tag">
                        {{ tag }}
                        <span class="tag-remove material-symbols-outlined"
                          (click)="removeRecipient(tag)">close</span>
                      </span>
                    }
                  </div>
                  <input type="email" class="tag-input"
                    [(ngModel)]="emailInput" name="emailInput"
                    placeholder="Add email and press Enter"
                    (keydown.enter)="$event.preventDefault(); addRecipient()" />
                </div>
                <span class="field-hint">Press Enter to add each recipient.</span>
              </div>
            }
          </div>

          <!-- SFTP -->
          <div class="channel-card" [class.enabled]="sftpEnabled">
            <div class="channel-header" (click)="sftpEnabled = !sftpEnabled">
              <div class="channel-identity">
                <div class="channel-icon-bg">
                  <span class="material-symbols-outlined">folder_shared</span>
                </div>
                <div>
                  <span class="channel-name">SFTP / FTP</span>
                  <span class="channel-type">Remote Server</span>
                </div>
              </div>
              <div class="toggle-switch" [class.on]="sftpEnabled">
                <div class="toggle-knob"></div>
              </div>
            </div>
            @if (sftpEnabled) {
              <div class="channel-body fields-grid">
                <div class="field-group">
                  <label class="field-label">Host</label>
                  <input type="text" class="field-input"
                    [(ngModel)]="sftpHost" name="sftpHost"
                    placeholder="sftp.example.com" />
                </div>
                <div class="field-group">
                  <label class="field-label">Port</label>
                  <input type="number" class="field-input"
                    [(ngModel)]="sftpPort" name="sftpPort"
                    placeholder="22" />
                </div>
                <div class="field-group">
                  <label class="field-label">Remote Path</label>
                  <input type="text" class="field-input"
                    [(ngModel)]="sftpPath" name="sftpPath"
                    placeholder="/reports/outbound/" />
                </div>
                <div class="field-group">
                  <label class="field-label">Username</label>
                  <input type="text" class="field-input"
                    [(ngModel)]="sftpUser" name="sftpUser"
                    placeholder="deploy-user" />
                </div>
              </div>
            }
          </div>

          <!-- Webhook -->
          <div class="channel-card" [class.enabled]="webhookEnabled">
            <div class="channel-header" (click)="webhookEnabled = !webhookEnabled">
              <div class="channel-identity">
                <div class="channel-icon-bg">
                  <span class="material-symbols-outlined">webhook</span>
                </div>
                <div>
                  <span class="channel-name">Webhook (JSON)</span>
                  <span class="channel-type">Real-time Notification</span>
                </div>
              </div>
              <div class="toggle-switch" [class.on]="webhookEnabled">
                <div class="toggle-knob"></div>
              </div>
            </div>
            @if (webhookEnabled) {
              <div class="channel-body">
                <div class="field-group">
                  <label class="field-label">Endpoint URL</label>
                  <input type="url" class="field-input"
                    [(ngModel)]="webhookUrl" name="webhookUrl"
                    placeholder="https://hooks.example.com/report-ready" />
                </div>
                <div class="field-group" style="margin-top:16px">
                  <label class="field-label">Secret Token (optional)</label>
                  <input type="password" class="field-input"
                    [(ngModel)]="webhookSecret" name="webhookSecret"
                    placeholder="Bearer token or HMAC secret" />
                </div>
              </div>
            }
          </div>

        </div>

        <!-- Security notice -->
        <div class="security-notice">
          <span class="material-symbols-outlined">lock</span>
          All channels use <strong>AES-256 encryption</strong> for data in transit.
          &nbsp;·&nbsp;
          <span class="global-link">
            <span class="material-symbols-outlined">language</span>
            Global Link Active
          </span>
        </div>
      </section>

      <!-- ── Form Actions ──────────────────────────────── -->
      <div class="form-actions">
        <button type="button" class="btn-tertiary" (click)="cancel()">Cancel</button>
        <button type="submit" class="btn-deploy">
          <span class="material-symbols-outlined">rocket_launch</span>
          Deploy Configuration
        </button>
      </div>

    </form>
  `,
  styles: [`
    .schedule-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 24px;
    }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; }
    .bc-link { color: #bb0012; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
    .bc-sep { font-size: 16px; color: #b8c9d3; }
    .bc-current { color: #506169; }

    /* Section card */
    .form-section { background: #ffffff; border-radius: 8px; padding: 32px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }

    .section-header {
      display: flex; align-items: flex-start; gap: 16px;
      margin-bottom: 28px; padding-bottom: 20px;
      border-bottom: 1px solid #edeeef;
    }
    .section-icon { font-size: 24px; color: #bb0012; margin-top: 2px; flex-shrink: 0; }
    .section-title {
      font-size: 1rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.05em; color: #191c1d; margin: 0 0 4px;
    }
    .section-desc { font-size: 0.8125rem; color: #506169; font-weight: 500; margin: 0; }

    .status-badge {
      margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 999px; font-size: 0.6875rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0;
      background: #edeeef; color: #506169;
    }
    .status-badge .material-symbols-outlined { font-size: 14px; }
    .status-badge.active { background: #e8f5e9; color: #1b5e20; }

    /* Fields */
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-group.half { max-width: 280px; }

    .field-label {
      font-size: 0.8125rem; font-weight: 700; color: #191c1d;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .required { color: #bb0012; }

    .field-input {
      padding: 10px 14px; border: 1px solid #e1e3e4; border-radius: 4px;
      font-size: 0.875rem; color: #191c1d; background: #fafafa;
      outline: none; font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .field-input:focus { border-color: #bb0012; box-shadow: 0 0 0 3px rgba(187,0,18,0.1); background: #fff; }
    .field-input.error { border-color: #bb0012; background: rgba(187,0,18,0.03); }
    .field-select { cursor: pointer; }
    .field-input.mono { font-family: 'Courier New', monospace; }

    .field-error {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.75rem; color: #bb0012; font-weight: 600;
    }
    .field-error .material-symbols-outlined { font-size: 14px; }
    .field-hint { font-size: 0.75rem; color: #b8c9d3; font-weight: 500; margin-top: 4px; }

    /* Frequency pills */
    .freq-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
    .freq-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 4px; border: 1.5px solid #e1e3e4;
      background: #fafafa; color: #506169; font-size: 0.8125rem; font-weight: 700;
      cursor: pointer; transition: all 0.15s; font-family: inherit;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .freq-pill .material-symbols-outlined { font-size: 18px; }
    .freq-pill:hover { border-color: #bb0012; color: #bb0012; background: #fff; }
    .freq-pill.active { border-color: #bb0012; background: rgba(187,0,18,0.04); color: #bb0012; }

    .freq-config { padding: 20px; background: #f8f9fa; border-radius: 6px; margin-bottom: 20px; }
    .freq-preview {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8125rem; color: #506169; font-weight: 500;
      margin: 12px 0 0; padding: 10px 12px;
      background: #fff; border-radius: 4px; border: 1px solid #edeeef;
    }
    .freq-preview .material-symbols-outlined { font-size: 16px; color: #b8c9d3; }

    /* Days of week */
    .day-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .day-pill {
      padding: 6px 14px; border-radius: 4px; border: 1.5px solid #e1e3e4;
      background: #fff; color: #506169; font-size: 0.75rem; font-weight: 700;
      cursor: pointer; transition: all 0.15s; font-family: inherit;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .day-pill.active { border-color: #bb0012; background: rgba(187,0,18,0.05); color: #bb0012; }

    /* Load badge */
    .load-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 999px;
      background: #fff8e1; color: #e65100;
      font-size: 0.6875rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-top: 8px;
    }
    .load-badge .material-symbols-outlined { font-size: 14px; }

    /* Channels */
    .channels-list { display: flex; flex-direction: column; gap: 12px; }

    .channel-card {
      border: 1.5px solid #e1e3e4; border-radius: 6px; overflow: hidden;
      transition: border-color 0.2s;
    }
    .channel-card.enabled { border-color: #bb0012; }

    .channel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; cursor: pointer; background: #fafafa;
      transition: background 0.15s;
    }
    .channel-card.enabled .channel-header { background: rgba(187,0,18,0.02); }
    .channel-header:hover { background: #f0f1f2; }

    .channel-identity { display: flex; align-items: center; gap: 14px; }
    .channel-icon-bg {
      width: 40px; height: 40px; border-radius: 8px;
      background: #edeeef; display: flex; align-items: center; justify-content: center;
      color: #506169; transition: all 0.15s;
    }
    .channel-card.enabled .channel-icon-bg { background: rgba(187,0,18,0.1); color: #bb0012; }
    .channel-icon-bg .material-symbols-outlined { font-size: 20px; }

    .channel-name {
      display: block; font-size: 0.875rem; font-weight: 700; color: #191c1d;
    }
    .channel-type { display: block; font-size: 0.75rem; color: #b8c9d3; font-weight: 500; }

    /* Toggle switch */
    .toggle-switch {
      width: 44px; height: 24px; border-radius: 999px; background: #e1e3e4;
      position: relative; transition: background 0.2s; flex-shrink: 0;
    }
    .toggle-switch.on { background: #bb0012; }
    .toggle-knob {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .toggle-switch.on .toggle-knob { transform: translateX(20px); }

    .channel-body { padding: 20px; border-top: 1px solid #edeeef; }

    /* Tag input */
    .tag-input-wrapper {
      border: 1px solid #e1e3e4; border-radius: 4px; padding: 8px 10px;
      background: #fafafa; display: flex; flex-wrap: wrap; gap: 6px;
      min-height: 44px; cursor: text;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .tag-input-wrapper:focus-within {
      border-color: #bb0012; box-shadow: 0 0 0 3px rgba(187,0,18,0.1); background: #fff;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px;
      background: rgba(187,0,18,0.08); color: #bb0012;
      font-size: 0.75rem; font-weight: 700;
    }
    .tag-remove {
      font-size: 14px; cursor: pointer; opacity: 0.6;
    }
    .tag-remove:hover { opacity: 1; }
    .tag-input {
      border: none; outline: none; font-size: 0.875rem;
      color: #191c1d; background: transparent; flex: 1;
      min-width: 180px; font-family: inherit; padding: 2px 4px;
    }

    /* Security notice */
    .security-notice {
      display: flex; align-items: center; gap: 8px;
      margin-top: 20px; padding: 12px 16px;
      background: #f8f9fa; border-radius: 4px;
      font-size: 0.8125rem; color: #506169; font-weight: 500;
    }
    .security-notice .material-symbols-outlined { font-size: 16px; color: #43a047; }
    .global-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: #1565c0; font-weight: 700;
    }
    .global-link .material-symbols-outlined { font-size: 14px; }

    /* Actions */
    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 40px;
    }
    .btn-tertiary {
      background: transparent; color: #191c1d; border: 1px solid #e1e3e4;
      padding: 11px 28px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-tertiary:hover { border-color: #b8c9d3; background: #f8f9fa; }
    .btn-deploy {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 28px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      background: #191c1d; color: #ffffff; border: none;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-deploy:hover { background: #2e3132; transform: translateY(-1px); }
    .btn-deploy .material-symbols-outlined { font-size: 18px; }
  `]
})
export class ScheduleTaskFormComponent {
  // ── Identity ──────────────────────────────────────────
  taskName = '';
  reportType = 'fleet';
  submitted = signal(false);
  nameError = computed(() => this.submitted() && !this.taskName.trim());

  // ── Scheduling ────────────────────────────────────────
  frequency = signal<Frequency>('daily');
  dailyTime = '08:00';
  weeklyTime = '08:00';
  selectedDays = signal<WeekDay[]>(['Mon']);
  specificDate = '';
  specificTime = '08:00';
  cronExpr = '0 8 * * 1-5';

  weekDays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  freqOptions: { value: Frequency; label: string; icon: string }[] = [
    { value: 'daily',    label: 'Daily',         icon: 'today' },
    { value: 'weekly',   label: 'Weekly',         icon: 'date_range' },
    { value: 'specific', label: 'Specific Date',  icon: 'event' },
    { value: 'cron',     label: 'CRON Expression', icon: 'terminal' },
  ];

  // ── Channels ──────────────────────────────────────────
  emailEnabled = true;
  emailRecipients: string[] = ['ops-team@zenith.com'];
  emailInput = '';

  sftpEnabled = false;
  sftpHost = '';
  sftpPort = 22;
  sftpPath = '';
  sftpUser = '';

  webhookEnabled = false;
  webhookUrl = '';
  webhookSecret = '';

  activeChannelCount = computed(() =>
    [this.emailEnabled, this.sftpEnabled, this.webhookEnabled].filter(Boolean).length
  );

  constructor(private router: Router) {}

  toggleDay(day: WeekDay): void {
    const current = this.selectedDays();
    this.selectedDays.set(
      current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    );
  }

  addRecipient(): void {
    const email = this.emailInput.trim();
    if (email && !this.emailRecipients.includes(email)) {
      this.emailRecipients = [...this.emailRecipients, email];
    }
    this.emailInput = '';
  }

  removeRecipient(email: string): void {
    this.emailRecipients = this.emailRecipients.filter(r => r !== email);
  }

  formatTime(time: string): string {
    if (!time) return '--:--';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  deploy(): void {
    this.submitted.set(true);
    if (!this.taskName.trim()) return;
    // TODO: integrate with backend API
    this.router.navigate(['/reporting/scheduled-tasks']);
  }

  cancel(): void {
    this.router.navigate(['/reporting/scheduled-tasks']);
  }
}
