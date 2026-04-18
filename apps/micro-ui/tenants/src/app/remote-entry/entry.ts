import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, TableComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Tenant } from '@cgomanager/shared-data-access';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonComponent, TableComponent],
  selector: 'app-tenants-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  tenants: Tenant[] = [];

  columns = [
    { key: 'name', label: 'Tenant Name' },
    { key: 'status', label: 'Status' },
    { key: 'plan', label: 'Subscription Plan' },
    { key: 'vehicles', label: 'Active Vehicles' }
  ];

  ngOnInit() {
    this.api.getTenants().subscribe(data => this.tenants = data);
  }
}
