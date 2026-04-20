import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { CheckboxGroupComponent, CheckboxGroupItem } from '../checkbox-group/checkbox-group.component';

@Component({
  selector: 'cgo-checkbox-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxComponent, CheckboxGroupComponent],
  template: `
    <div class="catalog">
      <div class="catalog__header">
        <h1 class="catalog__title">Checkboxes States Catalog</h1>
        <p class="catalog__subtitle">All operational states and size variants of the CGO checkbox component system.</p>
      </div>

      <!-- ── Group 1: Unchecked States ─────────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">Unchecked</h2>
        <div class="catalog__card">
          <div class="state-grid">
            <div class="state-item">
              <span class="state-label">DEFAULT</span>
              <cgo-checkbox></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">HOVERED</span>
              <cgo-checkbox class="pseudo-hover"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">FOCUSED</span>
              <cgo-checkbox class="pseudo-focus"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">DISABLED</span>
              <cgo-checkbox [disabled]="true"></cgo-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Group 2: Checked States ───────────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">Checked</h2>
        <div class="catalog__card">
          <div class="state-grid">
            <div class="state-item">
              <span class="state-label">DEFAULT</span>
              <cgo-checkbox [checked]="true"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">HOVERED</span>
              <cgo-checkbox [checked]="true" class="pseudo-hover"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">FOCUSED</span>
              <cgo-checkbox [checked]="true" class="pseudo-focus"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">DISABLED</span>
              <cgo-checkbox [checked]="true" [disabled]="true"></cgo-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Group 3: Indeterminate States ─────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">Indeterminate</h2>
        <div class="catalog__card">
          <div class="state-grid">
            <div class="state-item">
              <span class="state-label">DEFAULT</span>
              <cgo-checkbox [indeterminate]="true"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">HOVERED</span>
              <cgo-checkbox [indeterminate]="true" class="pseudo-hover"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">FOCUSED</span>
              <cgo-checkbox [indeterminate]="true" class="pseudo-focus"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">DISABLED</span>
              <cgo-checkbox [indeterminate]="true" [disabled]="true"></cgo-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Group 4: With Labels ───────────────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">With Labels</h2>
        <div class="catalog__card">
          <div class="state-grid state-grid--col2">
            <div class="state-item">
              <span class="state-label">LABEL ONLY</span>
              <cgo-checkbox label="Enable notifications"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">LABEL + HELPER</span>
              <cgo-checkbox
                label="Enable notifications"
                helperText="You'll receive alerts via email and push.">
              </cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">LABEL + CHECKED</span>
              <cgo-checkbox label="Active subscription" [checked]="true"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">DISABLED</span>
              <cgo-checkbox label="Feature locked" helperText="Contact admin to enable." [disabled]="true"></cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">ERROR STATE</span>
              <cgo-checkbox
                label="Accept terms"
                errorMessage="You must accept the terms to continue.">
              </cgo-checkbox>
            </div>
            <div class="state-item">
              <span class="state-label">ERROR CHECKED</span>
              <cgo-checkbox
                label="Conflicting option"
                [checked]="true"
                errorMessage="This selection conflicts with another rule.">
              </cgo-checkbox>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Group 5: Size Variants ─────────────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">Sizes</h2>
        <div class="catalog__card">
          <div class="size-row">
            <div class="state-item">
              <span class="state-label">SMALL (16px)</span>
              <div class="size-demo">
                <cgo-checkbox size="sm" label="Small unchecked"></cgo-checkbox>
                <cgo-checkbox size="sm" label="Small checked" [checked]="true"></cgo-checkbox>
                <cgo-checkbox size="sm" label="Small indeterminate" [indeterminate]="true"></cgo-checkbox>
              </div>
            </div>
            <div class="state-item">
              <span class="state-label">MEDIUM (20px) — DEFAULT</span>
              <div class="size-demo">
                <cgo-checkbox size="md" label="Medium unchecked"></cgo-checkbox>
                <cgo-checkbox size="md" label="Medium checked" [checked]="true"></cgo-checkbox>
                <cgo-checkbox size="md" label="Medium indeterminate" [indeterminate]="true"></cgo-checkbox>
              </div>
            </div>
            <div class="state-item">
              <span class="state-label">LARGE (24px)</span>
              <div class="size-demo">
                <cgo-checkbox size="lg" label="Large unchecked"></cgo-checkbox>
                <cgo-checkbox size="lg" label="Large checked" [checked]="true"></cgo-checkbox>
                <cgo-checkbox size="lg" label="Large indeterminate" [indeterminate]="true"></cgo-checkbox>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Group 6: In Context ────────────────────────────── -->
      <section class="catalog__section">
        <h2 class="catalog__section-title">In Context</h2>
        <div class="catalog__card">

          <!-- List row selector -->
          <div class="context-block">
            <span class="state-label">ROW SELECTOR (TABLE)</span>
            <div class="table-demo">
              @for (row of tableRows; track row.id) {
                <div class="table-row" [class.table-row--selected]="row.selected">
                  <cgo-checkbox
                    [checked]="row.selected"
                    (checkedChange)="row.selected = $event">
                  </cgo-checkbox>
                  <span class="table-row__name">{{ row.name }}</span>
                  <span class="table-row__status" [class]="'table-row__status--' + row.status">{{ row.status }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Select All group -->
          <div class="context-block">
            <span class="state-label">SELECT ALL / INDETERMINATE PARENT</span>
            <cgo-checkbox-group
              label="Notification Channels"
              helperText="Choose where to receive alerts"
              [items]="notificationItems"
              (itemsChange)="notificationItems = $event">
            </cgo-checkbox-group>
          </div>

          <!-- Reactive forms binding -->
          <div class="context-block">
            <span class="state-label">NGMODEL BINDING</span>
            <div class="form-group">
              <cgo-checkbox
                label="I agree to the Terms of Service"
                [(ngModel)]="termsAccepted">
              </cgo-checkbox>
              <cgo-checkbox
                label="Subscribe to marketing emails"
                [(ngModel)]="marketingOptIn">
              </cgo-checkbox>
              <div class="form-output">
                <span class="state-label">MODEL VALUES:</span>
                <code>terms={{ termsAccepted }}, marketing={{ marketingOptIn }}</code>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  `,
  styles: [`
    .catalog {
      padding: 32px;
      background: #f3f4f5;
      min-height: 100%;
      font-family: Inter, sans-serif;
    }

    .catalog__header { margin-bottom: 32px; }
    .catalog__title { font-size: 1.5rem; font-weight: 700; color: #191c1d; margin: 0 0 6px; }
    .catalog__subtitle { font-size: 0.875rem; color: #506169; margin: 0; }

    .catalog__section { margin-bottom: 32px; }
    .catalog__section-title {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #506169; margin: 0 0 12px;
    }

    .catalog__card {
      background: #ffffff; border-radius: 4px; padding: 24px;
      box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02);
    }

    /* State grid */
    .state-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .state-grid--col2 { grid-template-columns: repeat(2, 1fr); }

    .state-item { display: flex; flex-direction: column; gap: 10px; }
    .state-label {
      font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #506169;
    }

    /* Pseudo-state demos (static representations) */
    .pseudo-hover cgo-checkbox .cgo-checkbox__box { border-color: #191c1d; background: #f3f4f5; }
    .pseudo-focus cgo-checkbox .cgo-checkbox__box {
      outline: 2px solid #bb0012; outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(187,0,18,0.24);
    }

    /* Sizes */
    .size-row { display: flex; gap: 32px; flex-wrap: wrap; }
    .size-demo { display: flex; flex-direction: column; gap: 12px; }

    /* Table context */
    .context-block { margin-bottom: 28px; display: flex; flex-direction: column; gap: 12px; }
    .context-block:last-child { margin-bottom: 0; }

    .table-demo {
      background: #f8f9fa; border-radius: 4px; overflow: hidden;
    }
    .table-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px;
      transition: background 0.1s;
    }
    .table-row:not(:last-child) { margin-bottom: 1px; }
    .table-row--selected { background: #ffdad6; }
    .table-row:hover { background: #f0f1f2; }
    .table-row--selected:hover { background: #ffdad6; }

    .table-row__name { flex: 1; font-size: 0.875rem; font-weight: 500; color: #191c1d; }
    .table-row__status {
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; padding: 2px 8px; border-radius: 99px;
    }
    .table-row__status--active { background: #d1e2ec; color: #004c6b; }
    .table-row__status--inactive { background: #e1e3e4; color: #506169; }

    /* Form group */
    .form-group { display: flex; flex-direction: column; gap: 12px; }
    .form-output {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; background: #f3f4f5; border-radius: 4px;
    }
    .form-output code { font-size: 0.8rem; color: #191c1d; }
  `]
})
export class CheckboxCatalogComponent {
  termsAccepted = false;
  marketingOptIn = true;

  tableRows = [
    { id: 1, name: 'Satellite SAT-001',   status: 'active',   selected: true  },
    { id: 2, name: 'Satellite SAT-002',   status: 'inactive', selected: false },
    { id: 3, name: 'Satellite SAT-003',   status: 'active',   selected: true  },
    { id: 4, name: 'Ground Station GS-01',status: 'active',   selected: false },
  ];

  notificationItems: CheckboxGroupItem[] = [
    { id: 'email',  label: 'Email Alerts',    helperText: 'Sent to your registered address', checked: true  },
    { id: 'push',   label: 'Push Notifications', helperText: 'Real-time browser notifications', checked: true  },
    { id: 'sms',    label: 'SMS Alerts',      helperText: 'Standard rates may apply',        checked: false },
    { id: 'slack',  label: 'Slack Integration', helperText: 'Requires Slack workspace connection', checked: false, disabled: true },
  ];
}
