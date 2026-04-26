import { Component, ViewChild, TemplateRef, AfterViewInit, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedTableComponent, FormHeaderComponent, ButtonComponent } from '@cgomanager/shared-ui-kit';
import { RouterModule } from '@angular/router';
import { ApiService, KeycloakUser } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-user-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatedTableComponent, FormHeaderComponent, ButtonComponent, RouterModule],
  template: `
    <!-- Cell template definitions (not rendered directly) -->
    <ng-template #userCellTpl let-value let-row="row">
      <div class="user-cell">
        <div class="user-avatar" [style.background]="avatarColor(row.firstName || row.username)">{{ initials(row.firstName, row.lastName) || initials(row.username) }}</div>
        <div class="user-info">
          <div class="user-name-row">
            <span class="user-name">{{ row.firstName }} {{ row.lastName }}</span>
            <span class="federation-badge" *ngIf="row.isFederated" [title]="'Source: ' + row.federationName">
              <span class="material-symbols-outlined">hub</span>
              {{ row.federationName }}
            </span>
          </div>
          <div class="user-meta-row">
            <span class="user-id">@{{ row.username }}</span>
            <span class="user-custom-tag" *ngIf="row.distributor">
               <span class="material-symbols-outlined">store</span>
               {{ row.distributor }}
            </span>
             <span class="user-custom-tag" *ngIf="row.codigoPais">
               <span class="material-symbols-outlined">public</span>
               {{ row.codigoPais }}
            </span>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #statusCellTpl let-value>
      <span class="status-pill" [ngClass]="value ? 'status-active' : 'status-inactive'">
        <span class="status-dot-sm"></span>
        {{ value ? 'Active' : 'Inactive' }}
      </span>
    </ng-template>

    <ng-template #localeCellTpl let-value>
      <span class="locale-pill" *ngIf="value">
        <span class="material-symbols-outlined">language</span>
        {{ value | uppercase }}
      </span>
      <span *ngIf="!value" class="empty-hint">-</span>
    </ng-template>

    <ng-template #dateCellTpl let-value>
      {{ value | date:'mediumDate' }}
    </ng-template>

    <!-- Header -->
    <cgo-form-header
      title="User Directory"
      description="Manage system access, monitor user activity, and maintain organizational hierarchy for the C-GO ecosystem.">
      <div actions class="header-actions">
        <cgo-button variant="secondary">
          <span class="material-symbols-outlined">download</span>
          Export
        </cgo-button>
        <cgo-button variant="primary" routerLink="../user-edit">
          <span class="material-symbols-outlined">person_add</span>
          Register New User
        </cgo-button>
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
            [(ngModel)]="searchInput"
            (keyup.enter)="applyFilters()" />
        </div>

        <select class="filter-select" [(ngModel)]="statusInput">
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <div class="filter-actions">
          <cgo-button variant="tertiary" (click)="resetFilters()">Reset</cgo-button>
          <cgo-button variant="primary" (click)="applyFilters()">
            <span class="material-symbols-outlined">filter_list</span>
            Apply
          </cgo-button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card cloud-shadow">
      <cgo-paginated-table
        [columns]="columns"
        [data]="filteredUsers()"
        [pageSize]="10"
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
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 800;
      color: #ffffff; flex-shrink: 0;
      letter-spacing: 0.05em;
    }
    .user-info { display: flex; flex-direction: column; gap: 2px; }
    .user-name-row { display: flex; align-items: center; gap: 8px; }
    .user-name  { font-size: 0.875rem; font-weight: 700; color: #191c1d; }
    
    .federation-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: #e3f2fd;
      color: #1565c0;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .federation-badge .material-symbols-outlined { font-size: 12px; }

    .user-meta-row { display: flex; align-items: center; gap: 12px; }
    .user-id { font-size: 0.75rem; color: #b8c9d3; font-weight: 500; }
    
    .user-custom-tag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.6875rem;
      color: #506169;
      font-weight: 600;
    }
    .user-custom-tag .material-symbols-outlined { font-size: 11px; }

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
    .status-inactive { background: #ffebee; color: #b71c1c; }
    .status-inactive .status-dot-sm { background: #e53935; }

    /* ── Locale pill ─────────────────────────────────────── */
    .locale-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #f1f3f4;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #5f6368;
    }
    .locale-pill .material-symbols-outlined { font-size: 14px; }
    .empty-hint { color: #dadce0; font-size: 0.875rem; }

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
export class UserDirectoryComponent implements AfterViewInit, OnInit {
  @ViewChild('userCellTpl') userCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;
  @ViewChild('dateCellTpl') dateCellTpl!: TemplateRef<any>;
  @ViewChild('localeCellTpl') localeCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);

  customTemplates: { [key: string]: TemplateRef<any> } = {};

  // Filter state (inputs)
  searchInput = '';
  statusInput = 'all';

  // Applied filters (drive the computed)
  appliedFilters = signal({ search: '', status: 'all' });

  columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' | 'checkbox' | 'custom' }[] = [
    { key: 'firstName',   label: 'USER',   type: 'custom' },
    { key: 'email',  label: 'EMAIL' },
    { key: 'locale', label: 'LOCALE', type: 'custom' },
    { key: 'createdTimestamp', label: 'CREATED', type: 'custom' },
    { key: 'enabled', label: 'STATUS', type: 'custom' },
  ];

  allUsers = signal<KeycloakUser[]>([]);

  filteredUsers = computed(() => {
    const { status } = this.appliedFilters();
    return this.allUsers().filter(u => {
      const matchStatus = status === 'all' || u.enabled.toString() === status;
      return matchStatus;
    });
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(search?: string) {
    this.api.getUsers(search).subscribe({
      next: (users) => this.allUsers.set(users),
      error: (err) => console.error('Error loading users', err)
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.customTemplates = {
        firstName:   this.userCellTpl,
        enabled: this.statusCellTpl,
        createdTimestamp: this.dateCellTpl,
        locale: this.localeCellTpl
      };
    });
  }

  applyFilters(): void {
    this.loadUsers(this.searchInput);
    this.appliedFilters.set({
      search: this.searchInput,
      status: this.statusInput,
    });
  }

  resetFilters(): void {
    this.searchInput   = '';
    this.statusInput   = 'all';
    this.loadUsers();
    this.appliedFilters.set({ search: '', status: 'all' });
  }

  initials(first?: string, last?: string): string {
    if (first && last) return (first[0] + last[0]).toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    return '??';
  }

  avatarColor(name: string): string {
    const palette = ['#bb0012', '#1565c0', '#2e7d32', '#6a1b9a', '#e65100', '#00695c', '#4527a0'];
    const code = name ? name.charCodeAt(0) : 0;
    return palette[code % palette.length];
  }
}
