import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metric {
  label: string;
  value: string | number;
  trend: number;
}

export interface Tenant {
  id: string;
  name: string;
  status: string;
  subscription_plan: string;
  branding_json?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  modified_by?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connection_string: string;
  status: string;
  last_sync?: string;
  config_json?: any;
}

export interface ReportDefinition {
  id?: string;
  name: string;
  cube_name: string;
  data_source_id?: string;
  measures: any;
  dimensions: any;
  filters: any;
  format: 'xlsx' | 'csv' | 'parquet';
  delivery_json?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledTask {
  id: string;
  report_id: string;
  reportName?: string;
  cron: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  status: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  website: string;
  logo: string;
  _count?: { brands: number };
}

export interface Brand {
  id: string;
  manufacturer_id: string;
  name: string;
  description: string;
  image: string;
  tags: string;
  _count?: { device_models: number };
}

export interface DeviceModel {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  protocol_id?: string;
  protocol?: Protocol;
}

export interface Protocol {
  id: string;
  name: string;
  description?: string;
  _count?: { versions: number };
}

export interface ProtocolVersion {
  id: string;
  protocol_id: string;
  version: string;
  description?: string;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED';
  created_at: string;
  updated_at: string;
}

export interface KeycloakRole {
  id: string;
  name: string;
  level: 'realm' | 'client';
  clientId?: string;
  description?: string;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  createdTimestamp: number;
  roles?: KeycloakRole[];
  isFederated: boolean;
  federationName?: string | null;
  locale?: string | null;
  distributor?: string | null;
  codigoPais?: string | null;
}

// --- Iteration 2 Interfaces ---

export interface Language {
  id: string;
  iso_code: string;
  name: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  is_active: boolean;
  created_at?: string;
  _count?: { modules: number };
}

export interface Module {
  id: string;
  product_id: string;
  product?: Product;
  name: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  is_active: boolean;
  _count?: { features: number };
}

export interface Feature {
  id: string;
  module_id: string;
  module?: Module;
  name: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  is_active: boolean;
  allowed_roles: string[];
}

export interface Action {
  id: string;
  feature_id: string;
  feature?: Feature;
  name: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  is_active: boolean;
  allowed_roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  // --- Auth & Users ---
  checkAuth(): Observable<{ authenticated: boolean; user?: any }> {
    return this.http.get<{ authenticated: boolean; user?: any }>(`${this.baseUrl}/auth/me`, { withCredentials: true });
  }

  login(): void {
    window.location.href = `${this.baseUrl}/auth/login`;
  }

  getUsers(search?: string): Observable<KeycloakUser[]> {
    const url = search ? `${this.baseUrl}/users?search=${encodeURIComponent(search)}` : `${this.baseUrl}/users`;
    return this.http.get<KeycloakUser[]>(url, { withCredentials: true });
  }

  getUserById(id: string): Observable<KeycloakUser> {
    return this.http.get<KeycloakUser>(`${this.baseUrl}/users/${id}`, { withCredentials: true });
  }

  createUser(data: any): Observable<KeycloakUser> {
    return this.http.post<KeycloakUser>(`${this.baseUrl}/users`, data, { withCredentials: true });
  }

  updateUser(id: string, data: any): Observable<KeycloakUser> {
    return this.http.put<KeycloakUser>(`${this.baseUrl}/users/${id}`, data, { withCredentials: true });
  }

  getAvailableRoles(): Observable<KeycloakRole[]> {
    return this.http.get<KeycloakRole[]>(`${this.baseUrl}/roles`, { withCredentials: true });
  }

  createRole(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/roles`, data, { withCredentials: true });
  }

  // --- Languages ---
  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/languages`, { withCredentials: true });
  }

  createLanguage(data: any): Observable<Language> {
    return this.http.post<Language>(`${this.baseUrl}/languages`, data, { withCredentials: true });
  }

  // ... (existing methods)

  // Iteration 2: Security Management
  private securityBase = `${this.baseUrl}/security-mgmt`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.securityBase}/products`, { withCredentials: true });
  }

  createProduct(data: any): Observable<Product> {
    return this.http.post<Product>(`${this.securityBase}/products`, data, { withCredentials: true });
  }

  updateProduct(id: string, data: any): Observable<Product> {
    return this.http.put<Product>(`${this.securityBase}/products/${id}`, data, { withCredentials: true });
  }

  getModules(productId?: string): Observable<Module[]> {
    const url = productId ? `${this.securityBase}/modules?product_id=${productId}` : `${this.securityBase}/modules`;
    return this.http.get<Module[]>(url, { withCredentials: true });
  }

  createModule(data: any): Observable<Module> {
    return this.http.post<Module>(`${this.securityBase}/modules`, data, { withCredentials: true });
  }

  updateModule(id: string, data: any): Observable<Module> {
    return this.http.put<Module>(`${this.securityBase}/modules/${id}`, data, { withCredentials: true });
  }

  getFeatures(moduleId?: string): Observable<Feature[]> {
    const url = moduleId ? `${this.securityBase}/features?module_id=${moduleId}` : `${this.securityBase}/features`;
    return this.http.get<Feature[]>(url, { withCredentials: true });
  }

  createFeature(data: any): Observable<Feature> {
    return this.http.post<Feature>(`${this.securityBase}/features`, data, { withCredentials: true });
  }

  updateFeature(id: string, data: any): Observable<Feature> {
    return this.http.put<Feature>(`${this.securityBase}/features/${id}`, data, { withCredentials: true });
  }

  getActions(featureId?: string): Observable<Action[]> {
    const url = featureId ? `${this.securityBase}/actions?feature_id=${featureId}` : `${this.securityBase}/actions`;
    return this.http.get<Action[]>(url, { withCredentials: true });
  }

  createAction(data: any): Observable<Action> {
    return this.http.post<Action>(`${this.securityBase}/actions`, data, { withCredentials: true });
  }

  updateAction(id: string, data: any): Observable<Action> {
    return this.http.put<Action>(`${this.securityBase}/actions/${id}`, data, { withCredentials: true });
  }

  // Iteration 3: User Me
  updateMyAvatar(avatar: string): Observable<{ success: boolean, avatar: string }> {
    return this.http.patch<{ success: boolean, avatar: string }>(`${this.baseUrl}/users/me/avatar`, { avatar }, { withCredentials: true });
  }

  getMyPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/me/permissions`, { withCredentials: true });
  }

  changeMyPassword(password: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/users/me/password`, { password }, { withCredentials: true });
  }

  // --- Tenants ---
  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.baseUrl}/tenants`, { withCredentials: true });
  }

  getTenantById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/tenants/${id}`, { withCredentials: true });
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.baseUrl}/tenants/plans`, { withCredentials: true });
  }

  createTenant(tenant: any): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.baseUrl}/tenants`, tenant, { withCredentials: true });
  }

  updateTenant(id: string, tenant: any): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.baseUrl}/tenants/${id}`, tenant, { withCredentials: true });
  }

  deleteTenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tenants/${id}`, { withCredentials: true });
  }

  // --- Protocols / Manufacturers ---
  getManufacturers(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}/manufacturers`, { withCredentials: true });
  }

  createManufacturer(data: any): Observable<Manufacturer> {
    return this.http.post<Manufacturer>(`${this.baseUrl}/manufacturers`, data, { withCredentials: true });
  }

  updateManufacturer(id: string, data: any): Observable<Manufacturer> {
    return this.http.patch<Manufacturer>(`${this.baseUrl}/manufacturers/${id}`, data, { withCredentials: true });
  }

  deleteManufacturer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/manufacturers/${id}`, { withCredentials: true });
  }

  getBrands(manufacturerId: string): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/manufacturers/${manufacturerId}/brands`, { withCredentials: true });
  }

  createBrand(manufacturerId: string, data: any): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/manufacturers/${manufacturerId}/brands`, data, { withCredentials: true });
  }

  updateBrand(id: string, data: any): Observable<Brand> {
    return this.http.patch<Brand>(`${this.baseUrl}/brands/${id}`, data, { withCredentials: true });
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brands/${id}`, { withCredentials: true });
  }

  getModels(brandId: string): Observable<DeviceModel[]> {
    return this.http.get<DeviceModel[]>(`${this.baseUrl}/brands/${brandId}/models`, { withCredentials: true });
  }

  createModel(brandId: string, data: any): Observable<DeviceModel> {
    return this.http.post<DeviceModel>(`${this.baseUrl}/brands/${brandId}/models`, data, { withCredentials: true });
  }

  updateModel(id: string, data: any): Observable<DeviceModel> {
    return this.http.patch<DeviceModel>(`${this.baseUrl}/models/${id}`, data, { withCredentials: true });
  }

  deleteModel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/models/${id}`, { withCredentials: true });
  }

  getProtocols(): Observable<Protocol[]> {
    return this.http.get<Protocol[]>(`${this.baseUrl}/protocols`, { withCredentials: true });
  }

  createProtocol(data: any): Observable<Protocol> {
    return this.http.post<Protocol>(`${this.baseUrl}/protocols`, data, { withCredentials: true });
  }

  updateProtocol(id: string, data: any): Observable<Protocol> {
    return this.http.patch<Protocol>(`${this.baseUrl}/protocols/${id}`, data, { withCredentials: true });
  }

  deleteProtocol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/protocols/${id}`, { withCredentials: true });
  }

  getProtocolVersions(protocolId: string): Observable<ProtocolVersion[]> {
    return this.http.get<ProtocolVersion[]>(`${this.baseUrl}/protocols/${protocolId}/versions`, { withCredentials: true });
  }

  createProtocolVersion(protocolId: string, data: any): Observable<ProtocolVersion> {
    return this.http.post<ProtocolVersion>(`${this.baseUrl}/protocols/${protocolId}/versions`, data, { withCredentials: true });
  }

  updateProtocolVersion(id: string, data: any): Observable<ProtocolVersion> {
    return this.http.patch<ProtocolVersion>(`${this.baseUrl}/protocol-versions/${id}`, data, { withCredentials: true });
  }

  deleteProtocolVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/protocol-versions/${id}`, { withCredentials: true });
  }

  saveProtocolDesign(versionId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/protocol-versions/${versionId}/design`, data, { withCredentials: true });
  }

  getProtocolDesign(versionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/protocol-versions/${versionId}/design`, { withCredentials: true });
  }

  // --- Reporting ---
  getReports(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${this.baseUrl}/reports`, { withCredentials: true });
  }

  getReportById(id: string): Observable<ReportDefinition> {
    return this.http.get<ReportDefinition>(`${this.baseUrl}/reports/${id}`, { withCredentials: true });
  }

  createReport(data: any): Observable<ReportDefinition> {
    return this.http.post<ReportDefinition>(`${this.baseUrl}/reports`, data, { withCredentials: true });
  }

  updateReport(id: string, data: any): Observable<ReportDefinition> {
    return this.http.put<ReportDefinition>(`${this.baseUrl}/reports/${id}`, data, { withCredentials: true });
  }

  getDataSources(): Observable<DataSource[]> {
    return this.http.get<DataSource[]>(`${this.baseUrl}/datasources`, { withCredentials: true });
  }

  getDataSourceById(id: string): Observable<DataSource> {
    return this.http.get<DataSource>(`${this.baseUrl}/datasources/${id}`, { withCredentials: true });
  }

  createDataSource(data: any): Observable<DataSource> {
    return this.http.post<DataSource>(`${this.baseUrl}/datasources`, data, { withCredentials: true });
  }

  updateDataSource(id: string, data: any): Observable<DataSource> {
    return this.http.put<DataSource>(`${this.baseUrl}/datasources/${id}`, data, { withCredentials: true });
  }

  getScheduledTasks(): Observable<ScheduledTask[]> {
    return this.http.get<ScheduledTask[]>(`${this.baseUrl}/scheduled-tasks`, { withCredentials: true });
  }

  getScheduledTaskById(id: string): Observable<ScheduledTask> {
    return this.http.get<ScheduledTask>(`${this.baseUrl}/scheduled-tasks/${id}`, { withCredentials: true });
  }

  createScheduledTask(data: any): Observable<ScheduledTask> {
    return this.http.post<ScheduledTask>(`${this.baseUrl}/scheduled-tasks`, data, { withCredentials: true });
  }

  updateScheduledTask(id: string, data: any): Observable<ScheduledTask> {
    return this.http.put<ScheduledTask>(`${this.baseUrl}/scheduled-tasks/${id}`, data, { withCredentials: true });
  }

  deleteScheduledTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/scheduled-tasks/${id}`, { withCredentials: true });
  }

  getMetrics(): Observable<Metric[]> {
    return this.http.get<Metric[]>(`${this.baseUrl}/metrics`, { withCredentials: true });
  }
}
