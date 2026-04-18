import { Route } from '@angular/router';
import { ReportDesigner } from '../features/report-designer/report-designer';
import { AuditLogs } from '../features/audit-logs/audit-logs';

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'designer', pathMatch: 'full' },
  { path: 'designer', data: { breadcrumb: 'Designer' }, component: ReportDesigner },
  { path: 'logs', data: { breadcrumb: 'Audit Logs' }, component: AuditLogs },
];
