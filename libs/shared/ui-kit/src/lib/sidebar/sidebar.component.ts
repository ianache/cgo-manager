import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cgo-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  navItems = [
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

  expandedItems: Set<string> = new Set(['Security']); // Expand Security by default as requested

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
