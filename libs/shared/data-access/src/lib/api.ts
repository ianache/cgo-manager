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

  checkAuth(): Observable<{ authenticated: boolean; user?: any }> {
    return this.http.get<{ authenticated: boolean; user?: any }>(`${this.baseUrl}/auth/me`, { withCredentials: true });
  }

  login(): void {
    window.location.href = `${this.baseUrl}/auth/login`;
  }
}
