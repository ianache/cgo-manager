import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormHeaderComponent, PaginatedTableComponent, BaseTableComponent, GenericCardComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Manufacturer, Protocol, Brand, DeviceModel, ProtocolVersion } from '@cgomanager/shared-data-access';
import { ProtocolDesignerComponent } from '../protocol-designer';

@Component({
  standalone: true,
  imports: [CommonModule, FormHeaderComponent, PaginatedTableComponent, BaseTableComponent, GenericCardComponent, ProtocolDesignerComponent, FormsModule],
  selector: 'app-protocols-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  
  activeTab: 'manufacturers' | 'protocols' = 'manufacturers';
  viewMode: 'table' | 'cards' = 'table';
  showDesigner = false;
  showVersions = false;
  selectedProtocol: Protocol | null = null;
  selectedVersion: ProtocolVersion | null = null;
  
  selectedManufacturer: Manufacturer | null = null;
  selectedBrand: Brand | null = null;
  selectedModel: DeviceModel | null = null;

  manufacturers: Manufacturer[] = [];
  brands: Brand[] = [];
  models: DeviceModel[] = [];
  protocols: Protocol[] = [];
  versions: ProtocolVersion[] = [];

  manufacturerColumns = [
    { key: 'logo', label: 'Logo', type: 'image' as const },
    { key: 'name', label: 'Name' },
    { key: 'website', label: 'Website', type: 'link' as const },
  ];
  brandColumns = [
    { key: 'image', label: 'Image', type: 'image' as const },
    { key: 'name', label: 'Brand' },
    { key: 'tags', label: 'Labels', type: 'badges' as const },
  ];
  modelColumns = [
    { key: 'name', label: 'Model' }, 
    { key: 'protocol.name', label: 'Protocol' },
    { key: 'tags', label: 'Tags' }
  ];
  protocolColumns = [
    { key: 'id', label: 'ID' }, 
    { key: 'name', label: 'Protocol Name' }
  ];
  versionColumns = [{ key: 'version', label: 'Version' }, { key: 'status', label: 'Status' }, { key: 'updated_at', label: 'Updated' }];

  // Modal State
  showManufacturerModal = false;
  showBrandModal = false;
  showModelModal = false;
  showProtocolModal = false;
  
  editingManufacturer: Partial<Manufacturer> | null = null;
  editingBrand: Partial<Brand> | null = null;
  editingModel: Partial<DeviceModel> | null = null;
  editingProtocol: Partial<Protocol> | null = null;

  ngOnInit(): void {
    this.refreshManufacturers();
    this.refreshProtocols();
  }

  refreshManufacturers(): void {
    this.api.getManufacturers().subscribe(data => this.manufacturers = data);
  }

  refreshProtocols(): void {
    this.api.getProtocols().subscribe(data => this.protocols = data);
  }

  viewBrands(manufacturer: Manufacturer): void {
    this.selectedManufacturer = manufacturer;
    this.api.getBrands(manufacturer.id).subscribe(data => this.brands = data);
  }

  viewModels(brand: Brand): void {
    this.selectedBrand = brand;
    this.api.getModels(brand.id).subscribe(data => this.models = data);
  }

  viewProtocolsForModel(model: DeviceModel): void {
    this.selectedModel = model;
    this.activeTab = 'protocols';
    this.api.getProtocols().subscribe(all => {
      this.protocols = all;
    });
  }

  backToManufacturers(): void {
    this.selectedManufacturer = null;
    this.selectedBrand = null;
    this.selectedModel = null;
    this.refreshManufacturers();
  }

  backToBrands(): void {
    this.selectedBrand = null;
    this.selectedModel = null;
    if (this.selectedManufacturer) {
      this.viewBrands(this.selectedManufacturer);
    }
  }

  backToModels(): void {
    this.selectedModel = null;
    if (this.selectedBrand) {
      this.viewModels(this.selectedBrand);
    }
  }

  // Manufacturer Actions
  addManufacturer(): void {
    this.editingManufacturer = { name: '', website: '', logo: '' };
    this.showManufacturerModal = true;
  }

  editManufacturer(m: Manufacturer): void {
    this.editingManufacturer = { ...m };
    this.showManufacturerModal = true;
  }

  saveManufacturer(): void {
    if (!this.editingManufacturer || !this.editingManufacturer.name) return;
    
    const obs = this.editingManufacturer.id 
      ? this.api.updateManufacturer(this.editingManufacturer.id, this.editingManufacturer)
      : this.api.createManufacturer(this.editingManufacturer);
      
    obs.subscribe(() => {
      this.refreshManufacturers();
      this.closeModals();
    });
  }

  deleteManufacturer(id: string): void {
    if (confirm('Delete manufacturer?')) {
      this.api.deleteManufacturer(id).subscribe(() => this.refreshManufacturers());
    }
  }

  // Brand Actions
  addBrand(): void {
    if (!this.selectedManufacturer) return;
    this.editingBrand = { name: '', description: '', image: '', manufacturer_id: this.selectedManufacturer.id };
    this.showBrandModal = true;
  }

  editBrand(b: Brand): void {
    this.editingBrand = { ...b };
    this.showBrandModal = true;
  }

  saveBrand(): void {
    if (!this.editingBrand || !this.editingBrand.name || !this.editingBrand.manufacturer_id) return;
    
    const obs = this.editingBrand.id
      ? this.api.updateBrand(this.editingBrand.id, this.editingBrand)
      : this.api.createBrand(this.editingBrand.manufacturer_id, this.editingBrand);
      
    obs.subscribe(() => {
      if (this.selectedManufacturer) this.viewBrands(this.selectedManufacturer);
      this.closeModals();
    });
  }

  deleteBrand(id: string): void {
    if (confirm('Delete brand?')) {
      this.api.deleteBrand(id).subscribe(() => {
        if (this.selectedManufacturer) this.viewBrands(this.selectedManufacturer);
      });
    }
  }

  // Model Actions
  addModel(): void {
    if (!this.selectedBrand) return;
    this.editingModel = { name: '', description: '', brand_id: this.selectedBrand.id, protocol_id: '' };
    this.showModelModal = true;
  }

  editModel(m: DeviceModel): void {
    this.editingModel = { ...m };
    this.showModelModal = true;
  }

  saveModel(): void {
    if (!this.editingModel || !this.editingModel.name || !this.editingModel.brand_id) return;
    
    const obs = this.editingModel.id
      ? this.api.updateModel(this.editingModel.id, this.editingModel)
      : this.api.createModel(this.editingModel.brand_id, this.editingModel);
      
    obs.subscribe(() => {
      if (this.selectedBrand) this.viewModels(this.selectedBrand);
      this.closeModals();
    });
  }

  deleteModel(id: string): void {
    if (confirm('Delete model?')) {
      this.api.deleteModel(id).subscribe(() => {
        if (this.selectedBrand) this.viewModels(this.selectedBrand);
      });
    }
  }

  closeModals(): void {
    this.showManufacturerModal = false;
    this.showBrandModal = false;
    this.showModelModal = false;
    this.showProtocolModal = false;
    this.editingManufacturer = null;
    this.editingBrand = null;
    this.editingModel = null;
    this.editingProtocol = null;
  }

  // Protocol Actions
  addProtocol(): void {
    this.editingProtocol = { name: '', description: '' };
    this.showProtocolModal = true;
  }

  editProtocol(p: Protocol): void {
    this.editingProtocol = { ...p };
    this.showProtocolModal = true;
  }

  saveProtocol(): void {
    if (!this.editingProtocol || !this.editingProtocol.name) return;
    
    const obs = this.editingProtocol.id
      ? this.api.updateProtocol(this.editingProtocol.id, this.editingProtocol)
      : this.api.createProtocol(this.editingProtocol);
      
    obs.subscribe(() => {
      this.refreshProtocols();
      this.closeModals();
    });
  }

  deleteProtocol(id: string): void {
    if (confirm('Are you sure you want to delete this protocol?')) {
      this.api.deleteProtocol(id).subscribe(() => this.refreshProtocols());
    }
  }

  viewDesigner(protocol: Protocol): void {
    this.selectedProtocol = protocol;
    this.api.getProtocolVersions(protocol.id).subscribe(versions => {
      if (versions.length > 0) {
        this.selectedVersion = versions[0];
        this.showDesigner = true;
      } else {
        if (confirm('No versions found. Create initial version 1.0.0?')) {
          this.api.createProtocolVersion(protocol.id, { version: '1.0.0', status: 'DRAFT' }).subscribe(v => {
            this.selectedVersion = v;
            this.showDesigner = true;
          });
        }
      }
    });
  }

  viewVersions(protocol: Protocol): void {
    this.selectedProtocol = protocol;
    this.api.getProtocolVersions(protocol.id).subscribe(data => {
      this.versions = data;
      this.showVersions = true;
    });
  }

  openVersionInDesigner(version: ProtocolVersion): void {
    this.selectedVersion = version;
    this.showDesigner = true;
    this.showVersions = false;
  }

  addVersion(): void {
    if (!this.selectedProtocol) return;
    const p = this.selectedProtocol;
    const version = prompt('Version (e.g. 1.1.0):');
    if (version) {
      this.api.createProtocolVersion(p.id, { version, status: 'DRAFT' }).subscribe(() => {
        this.viewVersions(p);
      });
    }
  }

  updateVersionStatus(v: ProtocolVersion, status: 'DRAFT' | 'APPROVED' | 'PUBLISHED'): void {
    const p = this.selectedProtocol;
    this.api.updateProtocolVersion(v.id, { status }).subscribe(() => {
      if (p) this.viewVersions(p);
    });
  }

  deleteVersion(id: string): void {
    const p = this.selectedProtocol;
    if (confirm('Delete version?')) {
      this.api.deleteProtocolVersion(id).subscribe(() => {
        if (p) this.viewVersions(p);
      });
    }
  }

  onDesignerClose(): void {
    this.showDesigner = false;
    this.selectedVersion = null;
    if (!this.showVersions) {
      this.selectedProtocol = null;
    }
  }

  backToProtocols(): void {
    this.showVersions = false;
    this.selectedProtocol = null;
    this.refreshProtocols();
  }
}
