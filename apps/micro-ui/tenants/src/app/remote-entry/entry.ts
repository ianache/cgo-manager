import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatedTableComponent, FormHeaderComponent, ButtonComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Tenant, SubscriptionPlan } from '@cgomanager/shared-data-access';

@Component({
  standalone: true,
  imports: [CommonModule, PaginatedTableComponent, FormHeaderComponent, ButtonComponent, FormsModule],
  selector: 'app-tenants-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  
  showBranding = false;
  tenants: Tenant[] = [];
  plans: SubscriptionPlan[] = [];
  
  columns = [
    { key: 'name', label: 'Tenant Name' },
    { key: 'status', label: 'Status', type: 'custom' as const },
    { key: 'subscription_plan', label: 'Plan' },
    { key: 'created_at', label: 'Created' }
  ];

  labelColumns = [
    { key: 'key', label: 'Internal Key' },
    { key: 'es', label: 'Spanish (ES)', type: 'custom' as const },
    { key: 'en', label: 'English (EN)', type: 'custom' as const }
  ];

  // Modal & Form State
  showModal = false;
  editingTenant: Partial<Tenant> = { name: '', status: 'ACTIVE', subscription_plan: 'free' };
  
  // Branding State
  selectedTenantForBranding: Tenant | null = null;
  brandingConfig = {
    primaryColor: '#bb0012',
    secondaryColor: '#f8f9fa',
    backgroundColor: '#ffffff',
    logo: '',
    favicon: '',
    companyName: ''
  };

  labelSearchQuery = '';
  selectedModule = 'All';
  availableModules = ['Tracking', 'Reporting', 'Security', 'Billing'];
  isTranslating = false;
  filteredLabels: any[] = [
    { key: 'lbl_vehicle', es: { singular: 'Vehículo', plural: 'Vehículos' }, en: { singular: 'Vehicle', plural: 'Vehicles' } },
    { key: 'lbl_driver', es: { singular: 'Conductor', plural: 'Conductores' }, en: { singular: 'Driver', plural: 'Drivers' } }
  ];

  ngOnInit(): void {
    this.refreshTenants();
    this.api.getSubscriptionPlans().subscribe(data => this.plans = data);
  }

  refreshTenants(): void {
    this.api.getTenants().subscribe(data => this.tenants = data);
  }

  getTenantTemplates(statusTpl: TemplateRef<any>) {
    return { status: statusTpl };
  }

  addTenant(): void {
    this.editingTenant = { name: '', status: 'ACTIVE', subscription_plan: 'free' };
    this.showModal = true;
  }

  editTenant(tenant: Tenant): void {
    this.editingTenant = { ...tenant };
    this.showModal = true;
  }

  saveTenant(): void {
    if (!this.editingTenant.name) return;
    
    const obs = this.editingTenant.id 
      ? this.api.updateTenant(this.editingTenant.id, this.editingTenant)
      : this.api.createTenant(this.editingTenant);
      
    obs.subscribe(() => {
      this.refreshTenants();
      this.closeModal();
    });
  }

  deleteTenant(id: string): void {
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.api.deleteTenant(id).subscribe(() => this.refreshTenants());
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  openBranding(tenant: Tenant): void {
    this.selectedTenantForBranding = tenant;
    this.showBranding = true;
    
    if (tenant.branding_json) {
      try {
        const parsed = typeof tenant.branding_json === 'string' ? JSON.parse(tenant.branding_json) : tenant.branding_json;
        this.brandingConfig = { ...this.brandingConfig, ...parsed };
      } catch (e) {
        console.error('Error parsing branding JSON', e);
      }
    }
  }

  saveBranding(): void {
    if (!this.selectedTenantForBranding) return;
    
    const updatedTenant = {
      ...this.selectedTenantForBranding,
      branding_json: JSON.stringify(this.brandingConfig)
    };
    
    this.api.updateTenant(this.selectedTenantForBranding.id, updatedTenant).subscribe(() => {
      alert('Branding updated successfully');
      this.closeBranding();
    });
  }

  closeBranding(): void {
    this.showBranding = false;
    this.selectedTenantForBranding = null;
    this.refreshTenants();
  }

  addLanguage() {}
  aiTranslateAll() {
    this.isTranslating = true;
    setTimeout(() => this.isTranslating = false, 2000);
  }
}
