import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metric {
  label: string;
  value: string | number;
  trend: number;
}

export interface Tenant {
  id: number;
  name: string;
  status: string;
  subscriptionPlan: string;
  brandingJson?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

export interface ReportDefinition {
  id?: string;
  name: string;
  cubeName: string;
  measures: string[];
  dimensions: string[];
  filters: Array<{ member: string; operator: string; values: any[] }>;
  format: 'xlsx' | 'csv' | 'parquet';
  delivery: {
    channel: 'email' | 'ftp' | 'whatsapp';
    destination: string;
  };
  schedule?: {
    cron: string;
    enabled: boolean;
  };
}

export interface ExecutionLog {
  id: string;
  reportName: string;
  origin: 'Manual' | 'Scheduled';
  status: 'Success' | 'Error';
  timestamp: string;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  website: string;
  logo: string;
}

export interface Brand {
  id: string;
  manufacturerId: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
}

export interface DeviceModel {
  id: string;
  brandId: string;
  name: string;
  description: string;
  tags: string[];
  protocolId?: string;
  protocol?: Protocol;
}

export interface Protocol {
  id: string;
  name: string;
  description?: string;
}

export interface ProtocolVersion {
  id: string;
  protocolId: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
  designerData?: any;
}

export interface DataSource {
  id?: string;
  name: string;
  type: 'cube' | 'sql' | 'api';
  connectionString?: string;
  config?: any;
  status: 'active' | 'inactive';
  lastSync?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getMetrics(): Observable<Metric[]> {
    return this.http.get<Metric[]>(`${this.baseUrl}/metrics`, { withCredentials: true });
  }

  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.baseUrl}/tenants`, { withCredentials: true });
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/tenants/${id}`, { withCredentials: true });
  }

  createTenant(tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.baseUrl}/tenants`, tenant, { withCredentials: true });
  }

  updateTenant(id: number, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.baseUrl}/tenants/${id}`, tenant, { withCredentials: true });
  }

  deleteTenant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tenants/${id}`, { withCredentials: true });
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.baseUrl}/subscription-plans`, { withCredentials: true });
  }

  // Reporting Methods
  getReports(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${this.baseUrl}/reports`, { withCredentials: true });
  }

  getReportById(id: string): Observable<ReportDefinition> {
    return this.http.get<ReportDefinition>(`${this.baseUrl}/reports/${id}`, { withCredentials: true });
  }

  createReport(report: ReportDefinition): Observable<ReportDefinition> {
    return this.http.post<ReportDefinition>(`${this.baseUrl}/reports`, report, { withCredentials: true });
  }

  updateReport(id: string, report: Partial<ReportDefinition>): Observable<ReportDefinition> {
    return this.http.put<ReportDefinition>(`${this.baseUrl}/reports/${id}`, report, { withCredentials: true });
  }

  getExecutionLogs(): Observable<ExecutionLog[]> {
    return this.http.get<ExecutionLog[]>(`${this.baseUrl}/reports/logs`, { withCredentials: true });
  }

  // Data Source Methods
  getDataSources(): Observable<DataSource[]> {
    return this.http.get<DataSource[]>(`${this.baseUrl}/datasources`, { withCredentials: true });
  }

  getDataSourceById(id: string): Observable<DataSource> {
    return this.http.get<DataSource>(`${this.baseUrl}/datasources/${id}`, { withCredentials: true });
  }

  createDataSource(ds: DataSource): Observable<DataSource> {
    return this.http.post<DataSource>(`${this.baseUrl}/datasources`, ds, { withCredentials: true });
  }

  updateDataSource(id: string, ds: Partial<DataSource>): Observable<DataSource> {
    return this.http.put<DataSource>(`${this.baseUrl}/datasources/${id}`, ds, { withCredentials: true });
  }

  deleteDataSource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/datasources/${id}`, { withCredentials: true });
  }

  // Protocol Management Methods
  getManufacturers(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}/manufacturers`, { withCredentials: true });
  }

  createManufacturer(manufacturer: Partial<Manufacturer>): Observable<Manufacturer> {
    return this.http.post<Manufacturer>(`${this.baseUrl}/manufacturers`, manufacturer, { withCredentials: true });
  }

  updateManufacturer(id: string, manufacturer: Partial<Manufacturer>): Observable<Manufacturer> {
    return this.http.patch<Manufacturer>(`${this.baseUrl}/manufacturers/${id}`, manufacturer, { withCredentials: true });
  }

  deleteManufacturer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/manufacturers/${id}`, { withCredentials: true });
  }

  getBrands(manufacturerId: string): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/manufacturers/${manufacturerId}/brands`, { withCredentials: true });
  }

  createBrand(manufacturerId: string, brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/manufacturers/${manufacturerId}/brands`, brand, { withCredentials: true });
  }

  updateBrand(id: string, brand: Partial<Brand>): Observable<Brand> {
    return this.http.patch<Brand>(`${this.baseUrl}/brands/${id}`, brand, { withCredentials: true });
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brands/${id}`, { withCredentials: true });
  }

  getModels(brandId: string): Observable<DeviceModel[]> {
    return this.http.get<DeviceModel[]>(`${this.baseUrl}/brands/${brandId}/models`, { withCredentials: true });
  }

  createModel(brandId: string, model: Partial<DeviceModel>): Observable<DeviceModel> {
    return this.http.post<DeviceModel>(`${this.baseUrl}/brands/${brandId}/models`, model, { withCredentials: true });
  }

  updateModel(id: string, model: Partial<DeviceModel>): Observable<DeviceModel> {
    return this.http.patch<DeviceModel>(`${this.baseUrl}/models/${id}`, model, { withCredentials: true });
  }

  deleteModel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/models/${id}`, { withCredentials: true });
  }

  getProtocols(): Observable<Protocol[]> {
    return this.http.get<Protocol[]>(`${this.baseUrl}/protocols`, { withCredentials: true });
  }

  createProtocol(protocol: Partial<Protocol>): Observable<Protocol> {
    return this.http.post<Protocol>(`${this.baseUrl}/protocols`, protocol, { withCredentials: true });
  }

  updateProtocol(id: string, protocol: Partial<Protocol>): Observable<Protocol> {
    return this.http.patch<Protocol>(`${this.baseUrl}/protocols/${id}`, protocol, { withCredentials: true });
  }

  deleteProtocol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/protocols/${id}`, { withCredentials: true });
  }

  getProtocolVersions(protocolId: string): Observable<ProtocolVersion[]> {
    return this.http.get<ProtocolVersion[]>(`${this.baseUrl}/protocols/${protocolId}/versions`, { withCredentials: true }); 
  }

  createProtocolVersion(protocolId: string, version: Partial<ProtocolVersion>): Observable<ProtocolVersion> {
    return this.http.post<ProtocolVersion>(`${this.baseUrl}/protocols/${protocolId}/versions`, version, { withCredentials: true });
  }

  updateProtocolVersion(id: string, version: Partial<ProtocolVersion>): Observable<ProtocolVersion> {
    return this.http.patch<ProtocolVersion>(`${this.baseUrl}/protocol-versions/${id}`, version, { withCredentials: true });
  }

  deleteProtocolVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/protocol-versions/${id}`, { withCredentials: true });
  }

  saveProtocolDesign(versionId: string, designData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/protocol-versions/${versionId}/design`, designData, { withCredentials: true });
  }

  getProtocolDesign(versionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/protocol-versions/${versionId}/design`, { withCredentials: true });
  }

  checkAuth(): Observable<{ authenticated: boolean; user?: any }> {    return this.http.get<{ authenticated: boolean; user?: any }>(`${this.baseUrl}/auth/me`, { withCredentials: true });
  }

  login(): void {
    window.location.href = `${this.baseUrl}/auth/login`;
  }
}
