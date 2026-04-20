import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormHeaderComponent, CardRoleComponent, RoleData, CheckboxComponent } from '@cgomanager/shared-ui-kit';

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface PermissionModule {
  name: string;
  icon: string;
  permissions: Permission[];
}

interface Role extends RoleData {
  id: number;
  permissions: Record<string, boolean>;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormHeaderComponent, CardRoleComponent, CheckboxComponent],
  template: `
    <cgo-form-header
      title="Role Management"
      description="Define and manage granular access levels for your platform users.">
      <button actions class="btn-primary" (click)="createRole()">
        <span class="material-symbols-outlined">add</span>
        Create Custom Role
      </button>
    </cgo-form-header>

    <div class="roles-layout">
      <!-- Left Sidebar: Vertical Roles Column -->
      <aside class="roles-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">Available Roles</span>
          <span class="sidebar-count">{{ roles.length }}</span>
        </div>
        <div class="roles-list">
          @for (role of roles; track role.id) {
            <cgo-card-role
              [role]="role"
              [isSelected]="selectedRoleId() === role.id"
              (selectRole)="selectRole(role.id)">
            </cgo-card-role>
          }
        </div>
      </aside>

      <!-- Right Content: Permissions Detail -->
      <main class="permissions-detail cloud-shadow">
        @if (selectedRole(); as role) {
          <div class="detail-header">
            <div class="role-info">
              <div class="role-icon-bg">
                <span class="material-symbols-outlined">{{ role.icon }}</span>
              </div>
              <div>
                <h3 class="detail-role-name">{{ role.name }} Permissions</h3>
                <p class="detail-role-desc">{{ role.description }}</p>
              </div>
            </div>
            <div class="detail-actions">
              <button class="btn-tertiary">Discard</button>
              <button class="btn-primary">
                <span class="material-symbols-outlined">save</span>
                Update Permissions
              </button>
            </div>
          </div>

          <div class="permissions-matrix">
            @for (module of permissionModules; track module.name) {
              <div class="module-section">
                <div class="module-header">
                  <span class="material-symbols-outlined module-icon">{{ isValidIcon(module.icon) ? module.icon : 'folder' }}</span>
                  <span class="module-name">{{ module.name }}</span>
                </div>
                <div class="permissions-list">
                  @for (perm of module.permissions; track perm.key) {
                    <div class="permission-item" [class.granted]="getPermission(role, perm.key)">
                      <div class="perm-info">
                        <span class="perm-label">{{ perm.label }}</span>
                        <span class="perm-desc">{{ perm.description }}</span>
                      </div>
                      <cgo-checkbox
                        [checked]="getPermission(role, perm.key)"
                        (checkedChange)="togglePermission(role, perm.key)"
                        size="md">
                      </cgo-checkbox>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <span class="material-symbols-outlined empty-icon">security</span>
            <h3>Select a Role</h3>
            <p>Choose a role from the left column to manage its specific permissions.</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .roles-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
      margin-top: 24px;
      align-items: start;
    }

    /* ── Sidebar ────────────────────────────────────────── */
    .roles-sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
    }
    .sidebar-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #506169;
    }
    .sidebar-count {
      background: #edeeef;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #191c1d;
    }
    .roles-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ── Main Detail ────────────────────────────────────── */
    .permissions-detail {
      background: #ffffff;
      border-radius: 8px;
      min-height: 600px;
      display: flex;
      flex-direction: column;
    }
    .cloud-shadow {
      box-shadow: 0 12px 32px rgba(25, 28, 29, 0.04), 0 4px 8px rgba(25, 28, 29, 0.02);
    }
    .detail-header {
      padding: 32px;
      border-bottom: 1px solid #edeeef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .role-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .role-icon-bg {
      width: 56px;
      height: 56px;
      background: rgba(187, 0, 18, 0.05);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #bb0012;
    }
    .role-icon-bg .material-symbols-outlined { font-size: 32px; }
.detail-role-name {
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      margin: 0;
      color: #191c1d;
    }
    .detail-role-desc {
      font-size: 0.875rem;
      color: #506169;
      margin: 4px 0 0;
      font-weight: 500;
    }

    /* ── Matrix / Modules ───────────────────────────────── */
    .permissions-matrix {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .module-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f8f9fa;
    }
    .module-icon { color: #bb0012; font-size: 20px; }
    .module-name {
      font-size: 0.875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #191c1d;
    }
    .permissions-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .permission-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .permission-item.granted {
      background: #ffffff;
      border-color: rgba(187, 0, 18, 0.1);
      box-shadow: 0 4px 12px rgba(187, 0, 18, 0.03);
    }
    .perm-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .perm-label {
      font-size: 0.875rem;
      font-weight: 700;
      color: #191c1d;
    }
    .perm-desc {
      font-size: 0.75rem;
      color: #506169;
      font-weight: 500;
    }

    /* ── Empty State ────────────────────────────────────── */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #b8c9d3;
      padding: 64px;
      text-align: center;
    }
    .empty-icon { font-size: 64px; margin-bottom: 24px; opacity: 0.5; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 800; color: #191c1d; margin: 0; }
    .empty-state p { font-size: 0.875rem; margin: 8px 0 0; max-width: 300px; font-weight: 500; }

    /* ── Common Buttons ──────────────────────────────────── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 24px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      cursor: pointer; background: #bb0012; color: #ffffff; border: none;
      transition: all 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-tertiary {
      background: transparent; color: #191c1d; border: 1px solid #e1e3e4;
      padding: 10px 24px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
    }
  `]
})
export class RolesComponent {
  selectedRoleId = signal<number | null>(1);

  constructor(private router: Router) {}

  roles: Role[] = [
    {
      id: 1, name: 'Super Admin', description: 'Full access to all system features',
      userCount: 3, icon: 'admin_panel_settings',
      permissions: {
        'tenants:read': true, 'tenants:write': true, 'tenants:delete': true,
        'tracking:read': true, 'tracking:write': true,
        'users:read': true, 'users:write': true, 'users:delete': true,
      },
    },
    {
      id: 2, name: 'Fleet Manager', description: 'Manage tracking and fleet operations',
      userCount: 12, icon: 'satellite_alt',
      permissions: {
        'tenants:read': true, 'tenants:write': false, 'tenants:delete': false,
        'tracking:read': true, 'tracking:write': true,
        'users:read': true, 'users:write': false, 'users:delete': false,
      },
    },
    {
      id: 3, name: 'Admin', description: 'Can manage users and tenants',
      userCount: 8, icon: 'manage_accounts',
      permissions: {
        'tenants:read': true, 'tenants:write': true, 'tenants:delete': false,
        'tracking:read': true, 'tracking:write': false,
        'users:read': true, 'users:write': true, 'users:delete': false,
      },
    },
  ];

  permissionModules: PermissionModule[] = [
    {
      name: 'Tenants', icon: 'corporate_fare',
      permissions: [
        { key: 'tenants:read', label: 'View Tenants', description: 'List and view tenant details' },
        { key: 'tenants:write', label: 'Manage Tenants', description: 'Create and edit tenant records' },
        { key: 'tenants:delete', label: 'Delete Tenants', description: 'Remove tenants from the system' },
      ],
    },
    {
      name: 'Tracking', icon: 'satellite_alt',
      permissions: [
        { key: 'tracking:read', label: 'View Tracking', description: 'Access real-time satellite telemetry' },
        { key: 'tracking:write', label: 'Manage Tracking', description: 'Configure tracking parameters' },
      ],
    },
    {
      name: 'Users', icon: 'group',
      permissions: [
        { key: 'users:read', label: 'View Users', description: 'Browse the user directory' },
        { key: 'users:write', label: 'Manage Users', description: 'Create and edit user accounts' },
        { key: 'users:delete', label: 'Delete Users', description: 'Remove users from the platform' },
      ],
    },
  ];

  selectedRole = computed(() => {
    const id = this.selectedRoleId();
    return this.roles.find(r => r.id === id);
  });

  selectRole(id: number): void {
    this.selectedRoleId.set(id);
  }

  getPermission(role: Role, key: string): boolean {
    return role.permissions[key] ?? false;
  }

  togglePermission(role: Role, key: string): void {
    role.permissions[key] = !role.permissions[key];
  }

  isValidIcon(icon: string): boolean {
    return !!icon && icon.length < 30 && !icon.includes(' ') && !icon.includes('/');
  }

  createRole(): void {
    this.router.navigate(['/security/roles/create']);
  }
}
