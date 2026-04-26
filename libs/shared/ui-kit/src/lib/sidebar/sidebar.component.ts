import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'cgo-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private api = inject(ApiService);
  isAdmin = signal(false);

  navItems: any[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Tenants', path: '/tenants', icon: '🏢' },
    {
      label: 'Security',
      path: '/security',
      icon: '🛡️',
      children: [
        { label: 'User Directory', path: '/security/user-directory' },
        { label: 'Roles', path: '/security/roles' },
      ],
    },
    { label: 'Tracking', path: '/tracking', icon: '🛰️' },
    {
      label: 'Reporting',
      path: '/reporting',
      icon: '📈',
      children: [
        { label: 'Dashboards', path: '/reporting/dashboards' },
        { label: 'Data Sources', path: '/reporting/data-sources' },
        { label: 'Scheduled Tasks', path: '/reporting/scheduled-tasks' },
      ],
    },
    { label: 'Protocols', path: '/protocols', icon: '📝' },
    { label: 'Configuration', path: '/config', icon: '⚙️' },
  ];

  expandedItems: Set<string> = new Set(['Security']);

  ngOnInit() {
    this.api.checkAuth().subscribe(resp => {
      if (resp.authenticated && resp.user) {
        const roles: string[] = (resp.user.roles || []).map((r: string) => r.toLowerCase());
        if (roles.includes('admin')) {
          this.isAdmin.set(true);
          this.addAdminItems();
        }
      }
    });
  }

  addAdminItems() {
    const security = this.navItems.find(i => i.label === 'Security');
    if (security && security.children) {
      // Add Iteration 2 items if not already there
      if (!security.children.some((c: any) => c.label === 'Products')) {
        security.children.push(
          { label: 'Products', path: '/security/products' },
          { label: 'Languages', path: '/security/languages' }
        );
      }
    }
  }

  toggleSubmenu(label: string) {
    if (this.expandedItems.has(label)) {
      this.expandedItems.delete(label);
    } else {
      this.expandedItems.add(label);
    }
  }

  isExpanded(label: string): boolean {
    return this.expandedItems.has(label);
  }
}
