import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="user-edit-page">
      <div class="navigation">
        <button class="btn-back" routerLink="../user-directory">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Directory
        </button>
      </div>

      <div class="form-header-container">
        <h2 class="page-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>
        <p class="page-description">{{ isEditMode ? 'Update user profile and account settings.' : 'Add a new member to your team.' }}</p>
      </div>

      <div class="form-container cloud-shadow">
        <form [formGroup]="userForm" (ngSubmit)="saveUser()">
          <div class="form-grid">
            <div class="form-field">
              <label for="name">Full Name</label>
              <input id="name" type="text" formControlName="name" placeholder="e.g. John Doe">
            </div>

            <div class="form-field">
              <label for="email">Email Address</label>
              <input id="email" type="email" formControlName="email" placeholder="john@example.com">
            </div>

            <div class="form-field">
              <label for="role">Assigned Role</label>
              <select id="role" formControlName="role">
                <option value="">Select a role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            <div class="form-field">
              <label for="status">Account Status</label>
              <select id="status" formControlName="status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="../user-directory">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="userForm.invalid">
              <span class="material-symbols-outlined">{{ isEditMode ? 'save' : 'person_add' }}</span>
              {{ isEditMode ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .user-edit-page {
      max-width: 900px;
    }
    .navigation {
      margin-bottom: 32px;
    }
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: #506169;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0;
    }
    .btn-back:hover {
      color: #bb0012;
    }
    .form-header-container {
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      margin: 0;
      color: #191c1d;
    }
    .page-description {
      margin: 4px 0 0;
      color: #506169;
      font-weight: 500;
    }
    .form-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
    }
    .cloud-shadow {
      box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-field label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #506169;
    }
    .form-field input, .form-field select {
      padding: 12px 16px;
      background-color: #f8f9fa;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #191c1d;
      transition: all 0.2s;
    }
    .form-field input:focus, .form-field select:focus {
      outline: none;
      border-color: #bb0012;
      background-color: white;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 32px;
      border-top: 1px solid #edeeef;
    }
    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background-color: #bb0012;
      color: white;
      border: none;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-secondary {
      background-color: transparent;
      color: #191c1d;
      border: 1px solid #e1e3e4;
    }
    .material-symbols-outlined {
      font-size: 18px;
    }
  `]
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      // In a real app, we would fetch the user data here
      // For now, let's mock it
      this.userForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Super Admin',
        status: 'Active'
      });
    }
  }

  saveUser(): void {
    if (this.userForm.valid) {
      console.log('Saving user:', this.userForm.value);
      this.router.navigate(['../user-directory'], { relativeTo: this.route });
    }
  }
}
