import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, KeycloakRole, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="user-edit-page">
      <div class="navigation">
        <button class="btn-back" routerLink="/security/user-directory">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Directory
        </button>
      </div>

      <div class="form-header-container">
        <h2 class="page-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>
        <p class="page-description">{{ isEditMode ? 'Update user profile and account settings in Keycloak.' : 'Add a new member to your team.' }}</p>
      </div>

      <div class="form-container cloud-shadow">
        <form [formGroup]="userForm" (ngSubmit)="saveUser()">
          <div class="form-grid">
            <div class="form-field">
              <label for="firstName">First Name</label>
              <input id="firstName" type="text" formControlName="firstName" placeholder="e.g. John">
            </div>

            <div class="form-field">
              <label for="lastName">Last Name</label>
              <input id="lastName" type="text" formControlName="lastName" placeholder="e.g. Doe">
            </div>

            <div class="form-field">
              <label for="email">Email Address</label>
              <input id="email" type="email" formControlName="email" placeholder="john@example.com">
            </div>

            <div class="form-field">
              <label for="status">Account Status</label>
              <select id="status" formControlName="enabled">
                <option [value]="true">Active</option>
                <option [value]="false">Inactive</option>
              </select>
            </div>

            <div class="form-field">
              <label for="locale">Locale / Language</label>
              <select id="locale" formControlName="locale">
                <option value="es">Español (ES)</option>
                <option value="en">English (EN)</option>
                <option value="pt">Português (PT)</option>
              </select>
            </div>

            <div class="form-field">
              <label for="codigoPais">Country Code</label>
              <input id="codigoPais" type="text" formControlName="codigoPais" placeholder="e.g. PE, CL, CO">
            </div>

            <div class="form-field full-width">
              <label for="distributor">Distributor / Organization</label>
              <input id="distributor" type="text" formControlName="distributor" placeholder="e.g. Comsatel Global">
            </div>

            <div class="form-field full-width">
              <label>Assigned Roles (Realm & Client)</label>
              <div class="role-selector-box">
                <div class="role-category" *ngIf="realmRoles().length > 0">
                  <span class="category-label">Realm Roles</span>
                  <div class="roles-list">
                    <label *ngFor="let role of realmRoles()" class="role-item">
                      <input type="checkbox" [checked]="isRoleSelected(role.name)" (change)="toggleRole(role.name)">
                      <span class="role-name">{{ role.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="role-category" *ngIf="clientRoles().length > 0">
                  <span class="category-label">Client Roles (cgobackoffice)</span>
                  <div class="roles-list">
                    <label *ngFor="let role of clientRoles()" class="role-item">
                      <input type="checkbox" [checked]="isRoleSelected(role.name)" (change)="toggleRole(role.name)">
                      <span class="role-name">{{ role.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/security/user-directory">
              <span class="material-symbols-outlined">close</span>
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="userForm.invalid || isSaving()">
              <span class="material-symbols-outlined">{{ isSaving() ? 'sync' : (isEditMode ? 'save' : 'person_add') }}</span>
              {{ isSaving() ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .user-edit-page { max-width: 900px; }
    .navigation { margin-bottom: 32px; }
    .btn-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #506169; cursor: pointer; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; padding: 0; }
    .btn-back:hover { color: #bb0012; }
    .form-header-container { margin-bottom: 32px; }
    .page-title { font-size: 1.875rem; font-weight: 800; letter-spacing: -0.05em; margin: 0; color: #191c1d; }
    .page-description { margin: 4px 0 0; color: #506169; font-weight: 500; }
    .form-container { background: white; padding: 40px; border-radius: 8px; }
    .cloud-shadow { box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .form-field { display: flex; flex-direction: column; gap: 8px; }
    .full-width { grid-column: span 2; }
    .form-field label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #506169; }
    .form-field input, .form-field select { padding: 12px 16px; background-color: #f8f9fa; border: 1px solid #e1e3e4; border-radius: 4px; font-size: 0.875rem; color: #191c1d; transition: all 0.2s; }
    .form-field input:focus, .form-field select:focus { outline: none; border-color: #bb0012; background-color: white; }

    .role-selector-box { border: 1px solid #e1e3e4; border-radius: 4px; padding: 16px; background: #f8f9fa; }
    .role-category { margin-bottom: 16px; }
    .role-category:last-child { margin-bottom: 0; }
    .category-label { font-size: 0.625rem; font-weight: 800; color: #b8c9d3; text-transform: uppercase; margin-bottom: 8px; display: block; }
    .roles-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .role-item { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; cursor: pointer; color: #191c1d; }
    .role-item input { width: auto; padding: 0; margin: 0; }

    .form-actions { display: flex; justify-content: flex-end; gap: 16px; padding-top: 32px; border-top: 1px solid #edeeef; }
    .btn-primary, .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; height: 40px; }
    .btn-primary { background-color: #bb0012; color: white; border: none; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background-color: #edeeef; color: #191c1d; border: none; }
    .material-symbols-outlined { font-size: 18px; }
  `]
})
export class UserEditComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isSaving = signal(false);

  availableRoles = signal<KeycloakRole[]>([]);
  selectedRoles = signal<string[]>([]);

  realmRoles = signal<KeycloakRole[]>([]);
  clientRoles = signal<KeycloakRole[]>([]);

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true, Validators.required],
      locale: ['es'],
      distributor: [''],
      codigoPais: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser(this.userId);
    }
  }

  loadRoles() {
    this.api.getAvailableRoles().subscribe(roles => {
      this.availableRoles.set(roles);
      this.realmRoles.set(roles.filter(r => r.level === 'realm'));
      this.clientRoles.set(roles.filter(r => r.level === 'client'));
    });
  }

  loadUser(id: string) {
    this.api.getUserById(id).subscribe(user => {
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        enabled: user.enabled,
        locale: user.locale || 'es',
        distributor: user.distributor || '',
        codigoPais: user.codigoPais || ''
      });
      if (user.roles) {
        this.selectedRoles.set(user.roles.map(r => r.name));
      }
    });
  }

  isRoleSelected(name: string): boolean {
    return this.selectedRoles().includes(name);
  }

  toggleRole(name: string) {
    const current = this.selectedRoles();
    if (current.includes(name)) {
      this.selectedRoles.set(current.filter(r => r !== name));
    } else {
      this.selectedRoles.set([...current, name]);
    }
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isSaving.set(true);
      const data = {
        ...this.userForm.value,
        roles: this.selectedRoles()
      };

      const request = this.isEditMode && this.userId
        ? this.api.updateUser(this.userId, data)
        : this.api.createUser(data);

      request.subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toast.success(this.isEditMode ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
          this.router.navigate(['/security/user-directory']);
        },
        error: (err) => {
          this.isSaving.set(false);
          console.error('Error saving user', err);
          this.toast.error('Error al guardar la información en Keycloak');
        }
      });
    }
  }
}
