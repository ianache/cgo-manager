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
    { label: 'Tracking', path: '/tracking', icon: '🛰️' },
    { label: 'Reporting', path: '/reporting', icon: '📈' },
    { label: 'Protocols', path: '/protocols', icon: '📝' },
    { label: 'Configuration', path: '/config', icon: '⚙️' },
  ];
}
