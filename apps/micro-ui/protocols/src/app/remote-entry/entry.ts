import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormHeaderComponent, BaseTableComponent } from '@cgomanager/shared-ui-kit';
import { ApiService, Manufacturer, Protocol, Brand, DeviceModel } from '@cgomanager/shared-data-access';
import { ProtocolDesignerComponent } from '../protocol-designer';

@Component({
  standalone: true,
  imports: [CommonModule, FormHeaderComponent, BaseTableComponent, ProtocolDesignerComponent],
  selector: 'app-protocols-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent implements OnInit {
  private api = inject(ApiService);
  
  activeTab: 'manufacturers' | 'protocols' = 'manufacturers';
  showDesigner = false;
  selectedProtocol: Protocol | null = null;
  
  selectedManufacturer: Manufacturer | null = null;
  selectedBrand: Brand | null = null;

  manufacturers: Manufacturer[] = [];
  brands: Brand[] = [];
  models: DeviceModel[] = [];
  protocols: Protocol[] = [];

  manufacturerColumns = [{ key: 'name', label: 'Manufacturer' }, { key: 'website', label: 'Website' }];
  brandColumns = [{ key: 'name', label: 'Brand' }, { key: 'image', label: 'Image' }, { key: 'tags', label: 'Tags' }];
  modelColumns = [{ key: 'name', label: 'Model' }, { key: 'tags', label: 'Tags' }];
  protocolColumns = [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Protocol Name' }];

  ngOnInit() {
    this.refreshManufacturers();
    this.refreshProtocols();
  }

  refreshManufacturers() {
    this.api.getManufacturers().subscribe(data => this.manufacturers = data);
  }

  refreshProtocols() {
    this.api.getProtocols().subscribe(data => this.protocols = data);
  }

  viewBrands(manufacturer: Manufacturer) {
    this.selectedManufacturer = manufacturer;
    this.api.getBrands(manufacturer.id).subscribe(data => this.brands = data);
  }

  viewModels(brand: Brand) {
    this.selectedBrand = brand;
    this.api.getModels(brand.id).subscribe(data => this.models = data);
  }

  backToManufacturers() {
    this.selectedManufacturer = null;
    this.selectedBrand = null;
    this.refreshManufacturers();
  }

  backToBrands() {
    this.selectedBrand = null;
    if (this.selectedManufacturer) {
      this.viewBrands(this.selectedManufacturer);
    }
  }

  viewDesigner(protocol: Protocol) {
    this.selectedProtocol = protocol;
    this.showDesigner = true;
  }

  onDesignerClose() {
    this.showDesigner = false;
    this.selectedProtocol = null;
  }
}
