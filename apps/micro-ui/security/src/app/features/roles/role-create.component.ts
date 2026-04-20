import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadioGroupComponent, RadioButtonComponent } from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, RadioGroupComponent, RadioButtonComponent],
  template: `
    <div class="role-create-page">
      <div class="navigation">
        <button class="btn-back" routerLink="../">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Roles
        </button>
      </div>

      <div class="form-header-container">
        <h2 class="page-title">Create Custom Role</h2>
        <p class="page-description">Define a new security profile with specific access levels.</p>
      </div>

      <div class="form-container cloud-shadow">
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()">
          <div class="form-grid">
            <div class="form-field full-width">
              <label>Role Name</label>
              <input type="text" formControlName="name" placeholder="e.g. Regional Supervisor">
            </div>

            <div class="form-field full-width">
              <label>Description</label>
              <textarea formControlName="description" placeholder="Describe the purpose and scope of this role..."></textarea>
            </div>

            <div class="form-field full-width">
              <label>Role Type</label>
              <cgo-radio-group formControlName="type" direction="horizontal">
                <cgo-radio-button value="system" label="System Role"></cgo-radio-button>
                <cgo-radio-button value="tenant" label="Tenant Specific"></cgo-radio-button>
                <cgo-radio-button value="external" label="External Auditor"></cgo-radio-button>
              </cgo-radio-group>
            </div>

            <div class="form-field">
              <label>Access Level</label>
              <cgo-radio-group formControlName="level" direction="vertical">
                <cgo-radio-button value="read" label="Read Only"></cgo-radio-button>
                <cgo-radio-button value="write" label="Full Access"></cgo-radio-button>
                <cgo-radio-button value="admin" label="Administrative"></cgo-radio-button>
              </cgo-radio-group>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-tertiary" routerLink="../">Discard</button>
            <button type="submit" class="btn-primary" [disabled]="roleForm.invalid">
              <span class="material-symbols-outlined">save</span>
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .role-create-page { max-width: 900px; }
    .navigation { margin-bottom: 32px; }
    .btn-back {
      display: flex; align-items: center; gap: 8px;
      background: none; border: none; color: #506169;
      cursor: pointer; font-weight: 700; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.1em; padding: 0;
    }
    .btn-back:hover { color: #bb0012; }
    .page-title { font-size: 1.875rem; font-weight: 800; letter-spacing: -0.05em; margin: 0; color: #191c1d; }
    .page-description { margin: 4px 0 0; color: #506169; font-weight: 500; }
    .form-container { background: white; padding: 40px; border-radius: 8px; margin-top: 32px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .full-width { grid-column: span 2; }
    .form-field { display: flex; flex-direction: column; gap: 12px; }
    .form-field label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #506169; }
    input, textarea {
      padding: 12px 16px; background-color: #f8f9fa; border: 1px solid #e1e3e4;
      border-radius: 4px; font-size: 0.875rem; color: #191c1d; transition: all 0.2s;
    }
    textarea { min-height: 100px; resize: vertical; }
    input:focus, textarea:focus { outline: none; border-color: #bb0012; background-color: white; }
    .form-actions { display: flex; justify-content: flex-end; gap: 16px; padding-top: 32px; border-top: 1px solid #edeeef; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      background: #bb0012; color: #ffffff; border: none; transition: all 0.2s;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-tertiary {
      background: transparent; color: #191c1d; border: 1px solid #e1e3e4;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
    }
  `]
})
export class RoleCreateComponent {
  roleForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['system', Validators.required],
      level: ['read', Validators.required]
    });
  }

  saveRole() {
    if (this.roleForm.valid) {
      console.log('Saving role:', this.roleForm.value);
      this.router.navigate(['../'], { relativeTo: this.fb['control'] as any }); // Simplified for demo
    }
  }
}
