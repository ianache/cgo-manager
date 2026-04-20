import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormHeaderComponent, CheckboxComponent } from '@cgomanager/shared-ui-kit';

interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface PermissionModule {
  key: string;
  name: string;
  icon: string;
  description: string;
  perms: PermissionSet;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormHeaderComponent, CheckboxComponent],
  template: `
    <cgo-form-header
      [title]="isEditMode() ? 'Edit Role' : 'Create Custom Role'"
      description="Define security boundaries and access levels for system users.">
      <nav actions class="breadcrumb">
        <span class="bc-link" (click)="cancel()">Role Management</span>
        <span class="material-symbols-outlined bc-sep">chevron_right</span>
        <span class="bc-current">{{ isEditMode() ? 'Edit Role' : 'New Role' }}</span>
      </nav>
    </cgo-form-header>

    <form class="role-form" (ngSubmit)="save()">

      <!-- Role Identity -->
      <section class="form-section cloud-shadow">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon">badge</span>
          <div>
            <h3 class="section-title">Role Identity</h3>
            <p class="section-desc">Set a unique name and describe the purpose of this role.</p>
          </div>
        </div>

        <div class="fields-grid">
          <div class="field-group">
            <label class="field-label" for="roleName">
              Role Name <span class="required">*</span>
            </label>
            <input
              id="roleName"
              type="text"
              class="field-input"
              [class.error]="nameError()"
              [(ngModel)]="roleName"
              name="roleName"
              placeholder="e.g. Regional Fleet Manager"
              (ngModelChange)="onNameChange()" />
            @if (nameError()) {
              <span class="field-error">
                <span class="material-symbols-outlined">error</span>
                Role name is required.
              </span>
            }
          </div>

          <div class="field-group">
            <label class="field-label" for="roleDesc">Description</label>
            <textarea
              id="roleDesc"
              class="field-input field-textarea"
              [(ngModel)]="roleDescription"
              name="roleDescription"
              rows="3"
              placeholder="Describe what this role can do and who it is intended for.">
            </textarea>
          </div>
        </div>
      </section>

      <!-- Permissions Matrix -->
      <section class="form-section cloud-shadow">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon">rule</span>
          <div>
            <h3 class="section-title">Permissions Matrix</h3>
            <p class="section-desc">Select the operations this role is allowed to perform per module.</p>
          </div>
        </div>

        <div class="matrix-table">
          <!-- Header row -->
          <div class="matrix-header">
            <span class="col-module">Module</span>
            <span class="col-perm">View</span>
            <span class="col-perm">Create</span>
            <span class="col-perm">Edit</span>
            <span class="col-perm">Delete</span>
          </div>

          @for (mod of permissionModules; track mod.key) {
            <div class="matrix-row" [class.has-any]="hasAnyPerm(mod)">
              <div class="col-module-info">
                <span class="material-symbols-outlined mod-icon">{{ mod.icon }}</span>
                <div class="mod-text">
                  <span class="mod-name">{{ mod.name }}</span>
                  <span class="mod-desc">{{ mod.description }}</span>
                </div>
              </div>
              <div class="col-perm">
                <cgo-checkbox [checked]="mod.perms.view" (checkedChange)="mod.perms.view = $event" size="md"></cgo-checkbox>
              </div>
              <div class="col-perm">
                <cgo-checkbox [checked]="mod.perms.create" (checkedChange)="mod.perms.create = $event" size="md"></cgo-checkbox>
              </div>
              <div class="col-perm">
                <cgo-checkbox [checked]="mod.perms.edit" (checkedChange)="mod.perms.edit = $event" size="md"></cgo-checkbox>
              </div>
              <div class="col-perm">
                <cgo-checkbox [checked]="mod.perms.delete" (checkedChange)="mod.perms.delete = $event" size="md"></cgo-checkbox>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-tertiary" (click)="cancel()">Cancel</button>
        <button type="submit" class="btn-primary">
          <span class="material-symbols-outlined">save</span>
          {{ isEditMode() ? 'Update Role' : 'Save Role' }}
        </button>
      </div>

    </form>
  `,
  styles: [`
    .role-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 24px;
    }

    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .bc-link {
      color: #bb0012;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .bc-sep { font-size: 16px; color: #b8c9d3; }
    .bc-current { color: #506169; }

    /* Section card */
    .form-section {
      background: #ffffff;
      border-radius: 8px;
      padding: 32px;
    }
    .cloud-shadow {
      box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02);
    }
    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #edeeef;
    }
    .section-icon {
      font-size: 24px;
      color: #bb0012;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #191c1d;
      margin: 0 0 4px;
    }
    .section-desc {
      font-size: 0.8125rem;
      color: #506169;
      font-weight: 500;
      margin: 0;
    }

    /* Fields */
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #191c1d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .required { color: #bb0012; }
    .field-input {
      padding: 10px 14px;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #191c1d;
      background: #fafafa;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .field-input:focus {
      border-color: #bb0012;
      box-shadow: 0 0 0 3px rgba(187, 0, 18, 0.12);
      background: #ffffff;
    }
    .field-input.error { border-color: #bb0012; background: rgba(187,0,18,0.03); }
    .field-textarea { resize: vertical; min-height: 80px; }
    .field-error {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: #bb0012;
      font-weight: 600;
    }
    .field-error .material-symbols-outlined { font-size: 14px; }

    /* Matrix */
    .matrix-table {
      display: flex;
      flex-direction: column;
      border: 1px solid #edeeef;
      border-radius: 6px;
      overflow: hidden;
    }
    .matrix-header {
      display: grid;
      grid-template-columns: 1fr repeat(4, 80px);
      padding: 10px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #edeeef;
      align-items: center;
    }
    .matrix-header .col-module {
      font-size: 0.6875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #506169;
    }
    .matrix-header .col-perm {
      font-size: 0.6875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #506169;
      text-align: center;
    }
    .matrix-row {
      display: grid;
      grid-template-columns: 1fr repeat(4, 80px);
      padding: 16px 20px;
      border-bottom: 1px solid #f0f1f2;
      align-items: center;
      transition: background 0.15s;
    }
    .matrix-row:last-child { border-bottom: none; }
    .matrix-row:hover { background: #fafbfc; }
    .matrix-row.has-any { background: rgba(187, 0, 18, 0.015); }
    .col-module-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .mod-icon { font-size: 20px; color: #bb0012; }
    .mod-text { display: flex; flex-direction: column; gap: 2px; }
    .mod-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: #191c1d;
    }
    .mod-desc {
      font-size: 0.75rem;
      color: #b8c9d3;
      font-weight: 500;
    }
    .col-perm {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-bottom: 40px;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 28px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      cursor: pointer; background: #bb0012; color: #ffffff; border: none;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-tertiary {
      background: transparent; color: #191c1d; border: 1px solid #e1e3e4;
      padding: 10px 28px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-tertiary:hover { border-color: #b8c9d3; background: #f8f9fa; }
  `]
})
export class RoleFormComponent implements OnInit {
  roleName = '';
  roleDescription = '';
  submitted = signal(false);
  isEditMode = signal(false);

  nameError = computed(() => this.submitted() && !this.roleName.trim());

  permissionModules: PermissionModule[] = [
    {
      key: 'tenants', name: 'Tenants', icon: 'corporate_fare',
      description: 'Manage sub-accounts',
      perms: { view: false, create: false, edit: false, delete: false },
    },
    {
      key: 'tracking', name: 'Tracking', icon: 'satellite_alt',
      description: 'Satellite telemetry',
      perms: { view: false, create: false, edit: false, delete: false },
    },
    {
      key: 'users', name: 'Users', icon: 'group',
      description: 'Personnel management',
      perms: { view: false, create: false, edit: false, delete: false },
    },
    {
      key: 'system', name: 'System', icon: 'settings',
      description: 'Core configuration',
      perms: { view: false, create: false, edit: false, delete: false },
    },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!id);
  }

  onNameChange(): void {
    if (this.submitted()) this.submitted.set(false);
  }

  hasAnyPerm(mod: PermissionModule): boolean {
    return Object.values(mod.perms).some(Boolean);
  }

  save(): void {
    this.submitted.set(true);
    if (!this.roleName.trim()) return;
    // TODO: integrate with backend API
    this.router.navigate(['/security/roles']);
  }

  cancel(): void {
    this.router.navigate(['/security/roles']);
  }
}
