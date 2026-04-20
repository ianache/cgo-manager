import { Component, ViewChild, TemplateRef, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedTableComponent, FormHeaderComponent } from '@cgomanager/shared-ui-kit';
import { RouterModule } from '@angular/router';

type UserRole = 'Administrator' | 'Manager' | 'Operator' | 'Auditor';
type UserStatus = 'Active' | 'Inactive' | 'Pending';

interface User {
  id: number;
  user: string;
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

@Component({
  selector: 'app-user-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatedTableComponent, FormHeaderComponent, RouterModule],
  template: `
    <!-- Cell template definitions (not rendered directly) -->
    <ng-template #userCellTpl let-value let-row="row">
      <div class="user-cell">
        <div class="user-avatar" [style.background]="avatarColor(value)">{{ initials(value) }}</div>
        <div class="user-info">
          <span class="user-name">{{ value }}</span>
          <span class="user-id">ID: {{ row.userId }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #statusCellTpl let-value>
      <span class="status-pill status-{{ value.toLowerCase() }}">
        <span class="status-dot-sm"></span>
        {{ value }}
      </span>
    </ng-template>

    <!-- Header -->
    <cgo-form-header
      title="User Directory"
      description="Manage system access, monitor user activity, and maintain organizational hierarchy for the C-GO ecosystem.">
      <div actions class="header-actions">
        <button class="btn-secondary">
          <span class="material-symbols-outlined">download</span>
          Export
        </button>
        <button class="btn-primary" routerLink="../user-edit">
          <span class="material-symbols-outlined">person_add</span>
          Register New User
        </button>
      </div>
    </cgo-form-header>

    <!-- Filters -->
    <div class="filter-card cloud-shadow">
      <div class="filter-row">
        <div class="search-field">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            class="filter-input"
            placeholder="Search by name, email or ID…"
            [(ngModel)]="searchInput" />
        </div>

        <select class="filter-select" [(ngModel)]="roleInput">
          <option value="all">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
          <option value="Operator">Operator</option>
          <option value="Auditor">Auditor</option>
        </select>

        <select class="filter-select" [(ngModel)]="statusInput">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>

        <select class="filter-select" [(ngModel)]="lastLoginInput">
          <option value="anytime">Anytime</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <div class="filter-actions">
          <button class="btn-tertiary-sm" (click)="resetFilters()">Reset</button>
          <button class="btn-primary-sm" (click)="applyFilters()">
            <span class="material-symbols-outlined">filter_list</span>
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card cloud-shadow">
      <cgo-paginated-table
        [columns]="columns"
        [data]="filteredUsers()"
        [pageSize]="6"
        [showActions]="true"
        [customTemplates]="customTemplates">
        <ng-template #actionsTemplate let-user>
          <div class="actions-group">
            <button class="action-btn" [routerLink]="['../user-edit', user.id]" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="action-btn" title="More options">
              <span class="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </ng-template>
      </cgo-paginated-table>
    </div>
  `,
  styles: [`
    /* ── Header actions ─────────────────────────────────── */
    .header-actions { display: flex; gap: 12px; }

    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-primary { background: #bb0012; color: #ffffff; border: none; }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: #edeeef; color: #191c1d; border: none; }
    .btn-secondary:hover { background: #e1e3e4; }
    .btn-primary .material-symbols-outlined,
    .btn-secondary .material-symbols-outlined { font-size: 18px; }

    /* ── Filter card ─────────────────────────────────────── */
    .filter-card {
      background: #ffffff;
      border-radius: 8px;
      padding: 18px 24px;
      margin-top: 24px;
    }
    .cloud-shadow {
      box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02);
    }
    .filter-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 220px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 11px;
      font-size: 18px;
      color: #b8c9d3;
      pointer-events: none;
    }
    .filter-input {
      width: 100%;
      padding: 9px 12px 9px 38px;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      color: #191c1d;
      background: #fafafa;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .filter-input:focus {
      border-color: #bb0012;
      box-shadow: 0 0 0 3px rgba(187,0,18,0.1);
      background: #fff;
    }
    .filter-input::placeholder { color: #b8c9d3; }

    .filter-select {
      padding: 9px 32px 9px 12px;
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.8125rem;
      color: #191c1d;
      background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23506169' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;
      -webkit-appearance: none;
      appearance: none;
      outline: none;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .filter-select:focus { border-color: #bb0012; background-color: #fff; }

    .filter-actions { display: flex; gap: 8px; flex-shrink: 0; }

    .btn-tertiary-sm {
      padding: 9px 16px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      cursor: pointer; background: transparent;
      color: #506169; border: 1px solid #e1e3e4;
      font-family: inherit; transition: all 0.2s;
    }
    .btn-tertiary-sm:hover { border-color: #b8c9d3; background: #f8f9fa; }

    .btn-primary-sm {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 16px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      cursor: pointer; background: #bb0012; color: #fff;
      border: none; font-family: inherit; transition: all 0.2s;
    }
    .btn-primary-sm:hover { opacity: 0.9; }
    .btn-primary-sm .material-symbols-outlined { font-size: 16px; }

    /* ── Table card ──────────────────────────────────────── */
    .table-card {
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 24px;
    }

    /* ── User cell ───────────────────────────────────────── */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6875rem; font-weight: 800;
      color: #ffffff; flex-shrink: 0;
      letter-spacing: 0.05em;
    }
    .user-info { display: flex; flex-direction: column; gap: 1px; }
    .user-name  { font-size: 0.875rem; font-weight: 700; color: #191c1d; }
    .user-id    { font-size: 0.75rem; color: #b8c9d3; font-weight: 500; }

    /* ── Status badge ────────────────────────────────────── */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .status-dot-sm {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-active   { background: #e8f5e9; color: #1b5e20; }
    .status-active   .status-dot-sm { background: #43a047; }
    .status-inactive { background: #f5f5f5; color: #757575; }
    .status-inactive .status-dot-sm { background: #bdbdbd; }
    .status-pending  { background: #fff8e1; color: #e65100; }
    .status-pending  .status-dot-sm { background: #ffa000; }

    /* ── Action buttons ──────────────────────────────────── */
    .actions-group { display: flex; gap: 4px; justify-content: center; }
    .action-btn {
      background: none; border: none;
      color: #506169; cursor: pointer;
      padding: 6px; border-radius: 4px;
      display: flex; align-items: center;
      transition: background 0.15s, color 0.15s;
    }
    .action-btn:hover { background: #f0f1f2; color: #bb0012; }
    .action-btn .material-symbols-outlined { font-size: 18px; }
  `]
})
export class UserDirectoryComponent implements AfterViewInit {
  @ViewChild('userCellTpl') userCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  customTemplates: { [key: string]: TemplateRef<any> } = {};

  // Filter state (inputs)
  searchInput = '';
  roleInput = 'all';
  statusInput = 'all';
  lastLoginInput = 'anytime';

  // Applied filters (drive the computed)
  appliedFilters = signal({ search: '', role: 'all', status: 'all' });

  columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' | 'checkbox' | 'custom' }[] = [
    { key: 'user',   label: 'USER',   type: 'custom' },
    { key: 'email',  label: 'EMAIL' },
    { key: 'role',   label: 'ROLE' },
    { key: 'status', label: 'STATUS', type: 'custom' },
  ];

  allUsers: User[] = [
    { id: 1,  user: 'Alex Morgan',       userId: '9284-AX', email: 'a.morgan@cgomanager.com',    role: 'Administrator', status: 'Active' },
    { id: 2,  user: 'Sarah Williams',    userId: '4120-SW', email: 's.williams@cgomanager.com',  role: 'Manager',       status: 'Active' },
    { id: 3,  user: 'Julian Kang',       userId: '7731-JK', email: 'j.kang@cgomanager.com',      role: 'Operator',      status: 'Pending' },
    { id: 4,  user: 'Marcus Reid',       userId: '2209-MR', email: 'm.reid@cgomanager.com',      role: 'Auditor',       status: 'Inactive' },
    { id: 5,  user: 'Elena Torres',      userId: '3301-ET', email: 'e.torres@cgomanager.com',    role: 'Operator',      status: 'Active' },
    { id: 6,  user: 'David Chen',        userId: '5512-DC', email: 'd.chen@cgomanager.com',      role: 'Manager',       status: 'Active' },
    { id: 7,  user: 'Priya Sharma',      userId: '6643-PS', email: 'p.sharma@cgomanager.com',    role: 'Auditor',       status: 'Active' },
    { id: 8,  user: 'Tomás Ruiz',        userId: '8874-TR', email: 't.ruiz@cgomanager.com',      role: 'Operator',      status: 'Inactive' },
    { id: 9,  user: 'Nina Johansson',    userId: '1195-NJ', email: 'n.johansson@cgomanager.com', role: 'Manager',       status: 'Pending' },
    { id: 10, user: 'Omar Hassan',       userId: '9906-OH', email: 'o.hassan@cgomanager.com',    role: 'Administrator', status: 'Active' },
    { id: 11, user: 'Lena Fischer',      userId: '2237-LF', email: 'l.fischer@cgomanager.com',   role: 'Operator',      status: 'Active' },
    { id: 12, user: 'Bruno Costa',       userId: '3348-BC', email: 'b.costa@cgomanager.com',     role: 'Auditor',       status: 'Pending' },
  ];

  filteredUsers = computed(() => {
    const { search, role, status } = this.appliedFilters();
    return this.allUsers.filter(u => {
      const s = search.toLowerCase();
      const matchSearch = !s
        || u.user.toLowerCase().includes(s)
        || u.email.toLowerCase().includes(s)
        || u.userId.toLowerCase().includes(s);
      const matchRole   = role   === 'all' || u.role   === role;
      const matchStatus = status === 'all' || u.status === status;
      return matchSearch && matchRole && matchStatus;
    });
  });

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.customTemplates = {
        user:   this.userCellTpl,
        status: this.statusCellTpl,
      };
    });
  }

  applyFilters(): void {
    this.appliedFilters.set({
      search: this.searchInput,
      role:   this.roleInput,
      status: this.statusInput,
    });
  }

  resetFilters(): void {
    this.searchInput   = '';
    this.roleInput     = 'all';
    this.statusInput   = 'all';
    this.lastLoginInput = 'anytime';
    this.appliedFilters.set({ search: '', role: 'all', status: 'all' });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  avatarColor(name: string): string {
    const palette = ['#bb0012', '#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#00695c', '#4527a0'];
    return palette[name.charCodeAt(0) % palette.length];
  }
}
