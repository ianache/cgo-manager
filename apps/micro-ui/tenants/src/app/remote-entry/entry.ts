import { Component, OnInit, inject, TemplateRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, PaginatedTableComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Tenant, SubscriptionPlan } from '@cgomanager/shared-data-access';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonComponent, PaginatedTableComponent, FormsModule],
  selector: 'app-tenants-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  tenants: Tenant[] = [];
  plans: SubscriptionPlan[] = [];

  columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tenant Name' },
    { key: 'status', label: 'Status' },
    { key: 'subscriptionPlan', label: 'Subscription Plan' },
    { key: 'createdAt', label: 'Created' }
  ];

  // Modal State
  showModal = false;
  editingTenant: Partial<Tenant> | null = null;

  // Branding State
  showBranding = false;
  selectedTenantForBranding: Tenant | null = null;
  
  // New Modular Label Structure
  availableModules = ['General', 'Telemetry', 'Tracking', 'Reporting', 'Maintenance', 'Billing'];
  selectedModule = 'General';
  labelSearchQuery = '';
  languages = ['en', 'es']; // Default languages

  brandingConfig: any = {
    logo: '',
    favicon: '',
    primaryColor: '#BB0012',
    secondaryColor: '#506169',
    backgroundColor: '#F8F9FA',
    labels: [
      { key: 'vehicles', module: 'General', en: { singular: 'Vehicle', plural: 'Vehicles' }, es: { singular: 'Vehículo', plural: 'Vehículos' } },
      { key: 'operator', module: 'General', en: { singular: 'Operator', plural: 'Operators' }, es: { singular: 'Operador', plural: 'Operadores' } },
      { key: 'mission', module: 'Tracking', en: { singular: 'Mission', plural: 'Missions' }, es: { singular: 'Misión', plural: 'Misiones' } },
      { key: 'inventory', module: 'General', en: { singular: 'Inventory', plural: 'Inventories' }, es: { singular: 'Inventario', plural: 'Inventarios' } },
      { key: 'device', module: 'Telemetry', en: { singular: 'Device', plural: 'Devices' }, es: { singular: 'Dispositivo', plural: 'Dispositivos' } },
      { key: 'maintenance', module: 'Maintenance', en: { singular: 'Maintenance', plural: 'Maintenance' }, es: { singular: 'Mantenimiento', plural: 'Mantenimiento' } }
    ]
  };

  labelColumns: any[] = [];
  
  // Logic to build the template object for the table
  getTenantTemplates(statusTemplate: TemplateRef<any>) {
    return { 'status': statusTemplate };
  }

  getBrandingTemplates(tplRefs: { [key: string]: TemplateRef<any> }) {
    return tplRefs;
  }

  ngOnInit() {
    this.refreshTenants();
    this.api.getSubscriptionPlans().subscribe(data => this.plans = data);
    this.updateLabelColumns();
  }

  updateLabelColumns() {
    this.labelColumns = [
      { key: 'selected', label: '', type: 'checkbox' },
      { key: 'key', label: 'Nombre de Label' },
      ...this.languages.map(lang => ({ 
        key: lang, 
        label: lang.toUpperCase(),
        type: 'custom'
      }))
    ];
  }

  get filteredLabels() {
    return this.brandingConfig.labels.filter((l: any) => {
      const matchesModule = this.selectedModule === 'All' || l.module === this.selectedModule;
      const matchesSearch = !this.labelSearchQuery || l.key.toLowerCase().includes(this.labelSearchQuery.toLowerCase());
      return matchesModule && matchesSearch;
    });
  }

  addLanguage() {
    const lang = prompt('Enter language code (e.g. fr, pt):');
    if (lang && !this.languages.includes(lang)) {
      this.languages.push(lang);
      // Initialize translations for the new language
      this.brandingConfig.labels.forEach((l: any) => {
        l[lang] = { singular: '', plural: '' };
      });
      this.updateLabelColumns();
    }
  }

  isTranslating = false;

  aiTranslateAll() {
    const selectedLabels = this.brandingConfig.labels.filter((l: any) => l.selected);
    
    if (selectedLabels.length === 0) {
      alert('Please select at least one label to translate.');
      return;
    }

    const targetLang = prompt('Translate selected labels to which language code?', 'es');
    if (!targetLang || !this.languages.includes(targetLang)) {
      alert('Invalid or non-existent language code.');
      return;
    }
    
    this.isTranslating = true;
    
    // Simulate AI Processing time
    setTimeout(() => {
      selectedLabels.forEach((l: any) => {
        // Mock translation logic based on English source
        const source = l.en || { singular: l.key, plural: l.key };
        
        if (!l[targetLang]) l[targetLang] = { singular: '', plural: '' };
        
        // Simple mock translation (adding a language-specific prefix)
        const prefix = targetLang === 'es' ? 'Trad: ' : `[${targetLang.toUpperCase()}] `;
        
        l[targetLang].singular = `${prefix}${source.singular}`;
        l[targetLang].plural = `${prefix}${source.plural}`;
        
        // Unselect after translation
        l.selected = false;
      });
      
      this.isTranslating = false;
      alert(`AI Translation complete: ${selectedLabels.length} labels processed.`);
    }, 2500);
  }

  // ... (rest of branding methods)
  openBranding(tenant: Tenant) {
    this.selectedTenantForBranding = tenant;
    if (tenant.brandingJson) {
      try {
        const parsed = JSON.parse(tenant.brandingJson);
        // Migration logic for old structure if needed
        if (!Array.isArray(parsed.labels)) {
           // ... (complex migration omitted for brevity, using default if corrupt)
           parsed.labels = this.brandingConfig.labels;
        }
        this.brandingConfig = parsed;
        // Detect languages from data
        const firstLabel = this.brandingConfig.labels[0];
        if (firstLabel) {
           this.languages = Object.keys(firstLabel).filter(k => k !== 'key' && k !== 'module');
        }
      } catch (e) {
        console.error('Error parsing branding JSON', e);
      }
    }
    this.updateLabelColumns();
    this.showBranding = true;
  }

  saveBranding() {
    if (!this.selectedTenantForBranding) return;
    
    const updatedTenant: Partial<Tenant> = {
      brandingJson: JSON.stringify(this.brandingConfig)
    };

    this.api.updateTenant(this.selectedTenantForBranding.id, updatedTenant).subscribe({
      next: () => {
        this.refreshTenants();
        this.closeBranding();
      },
      error: (err) => console.error('Error saving branding', err)
    });
  }

  closeBranding() {
    this.showBranding = false;
    this.selectedTenantForBranding = null;
  }

  addTenant() {
    this.editingTenant = {
      name: '',
      status: 'ACTIVE',
      subscriptionPlan: 'free'
    };
    this.showModal = true;
  }

  editTenant(tenant: Tenant) {
    this.editingTenant = { ...tenant };
    this.showModal = true;
  }

  saveTenant() {
    if (!this.editingTenant || !this.editingTenant.name) return;

    const obs = this.editingTenant.id !== undefined
      ? this.api.updateTenant(this.editingTenant.id, this.editingTenant)
      : this.api.createTenant(this.editingTenant);

    obs.subscribe({
      next: () => {
        this.refreshTenants();
        this.closeModal();
      },
      error: (err) => console.error('Error saving tenant', err)
    });
  }

  deleteTenant(id: number) {
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.api.deleteTenant(id).subscribe({
        next: () => {
          this.refreshTenants();
        },
        error: (err) => console.error('Error deleting tenant', err)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingTenant = null;
  }

  refreshTenants() {
    this.api.getTenants().subscribe(data => this.tenants = data);
  }
}
