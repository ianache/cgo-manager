import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService, ToastService } from '@cgomanager/shared-data-access';
import { ButtonComponent, FormHeaderComponent } from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ButtonComponent, FormHeaderComponent],
  template: `
    <div class="role-create-page">
      <cgo-form-header 
        title="Create Custom Role" 
        description="Define a new security role to control access to specific features and actions.">
      </cgo-form-header>

      <div class="form-container cloud-shadow">
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="name">Role Name</label>
              <input id="name" type="text" formControlName="name" placeholder="e.g. specialized_editor">
              <p class="field-hint">Use underscores for spaces. Avoid special characters.</p>
            </div>

            <div class="form-field full-width">
              <label for="description">Description</label>
              <textarea id="description" formControlName="description" rows="3" placeholder="Briefly describe the purpose of this role..."></textarea>
            </div>

            <div class="form-field">
              <label for="level">Role Level</label>
              <select id="level" formControlName="level">
                <option value="realm">Global (Realm Level)</option>
                <option value="client">Application Specific (Client Level)</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <cgo-button variant="secondary" routerLink="../roles">
              <span class="material-symbols-outlined">close</span>
              Cancel
            </cgo-button>
            <cgo-button variant="primary" (click)="saveRole()" [disabled]="roleForm.invalid || isSaving()">
              <span class="material-symbols-outlined" *ngIf="isSaving()">sync</span>
              <span class="material-symbols-outlined" *ngIf="!isSaving()">security</span>
              {{ isSaving() ? 'Creating...' : 'Create Role' }}
            </cgo-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .role-create-page { padding: 32px; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .form-container { background: white; padding: 40px; border-radius: 8px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }
    
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 32px; margin-bottom: 40px; }
    .full-width { grid-column: span 1; }
    
    .form-field { display: flex; flex-direction: column; gap: 8px; }
    .form-field label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #506169; }
    .form-field input, .form-field select, .form-field textarea {
      padding: 12px 16px;
      background-color: #f8f9fa;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #191c1d;
      outline: none;
      transition: all 0.2s;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #bb0012; background-color: white; }
    .field-hint { font-size: 0.75rem; color: #b8c9d3; margin: 0; }

    .form-actions { display: flex; justify-content: flex-end; gap: 16px; padding-top: 32px; border-top: 1px solid #edeeef; }
  `]
})
export class RoleCreateComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  roleForm: FormGroup;
  isSaving = signal(false);

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      description: [''],
      level: ['client', Validators.required]
    });
  }

  saveRole() {
    if (this.roleForm.valid) {
      this.isSaving.set(true);
      this.api.createRole(this.roleForm.value).subscribe({
        next: () => {
          this.toast.success('Rol creado exitosamente en Keycloak');
          this.isSaving.set(false);
          this.router.navigate(['../roles']);
        },
        error: (err) => {
          this.isSaving.set(false);
          console.error('Error creating role', err);
          this.toast.error('Error al crear el rol en Keycloak');
        }
      });
    }
  }
}
