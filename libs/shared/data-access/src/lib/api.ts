import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metric {
  label: string;
  value: string | number;
  trend: number;
}

export interface Tenant {
  name: string;
  status: string;
  plan: string;
  vehicles: number;
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
}

export interface Protocol {
  id: string;
  name: string;
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

  // Reporting Methods
  getReports(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${this.baseUrl}/reports`, { withCredentials: true });
  }

  createReport(report: ReportDefinition): Observable<ReportDefinition> {
    return this.http.post<ReportDefinition>(`${this.baseUrl}/reports`, report, { withCredentials: true });
  }

  getExecutionLogs(): Observable<ExecutionLog[]> {
    return this.http.get<ExecutionLog[]>(`${this.baseUrl}/reports/logs`, { withCredentials: true });
  }

  // Protocol Management Methods
  getManufacturers(): Observable<Manufacturer[]> {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}/manufacturers`, { withCredentials: true });
  }

  getBrands(manufacturerId: string): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/manufacturers/${manufacturerId}/brands`, { withCredentials: true });
  }

  getModels(brandId: string): Observable<DeviceModel[]> {
    return this.http.get<DeviceModel[]>(`${this.baseUrl}/brands/${brandId}/models`, { withCredentials: true });
  }

  getProtocols(): Observable<Protocol[]> {
    return this.http.get<Protocol[]>(`${this.baseUrl}/protocols`, { withCredentials: true });
  }

  getProtocolVersions(protocolId: string): Observable<ProtocolVersion[]> {
    return this.http.get<ProtocolVersion[]>(`${this.baseUrl}/protocols/${protocolId}/versions`, { withCredentials: true });
  }

  checkAuth(): Observable<{ authenticated: boolean; user?: any }> {
    return this.http.get<{ authenticated: boolean; user?: any }>(`${this.baseUrl}/auth/me`, { withCredentials: true });
  }

  login(): void {
    window.location.href = `${this.baseUrl}/auth/login`;
  }
}
