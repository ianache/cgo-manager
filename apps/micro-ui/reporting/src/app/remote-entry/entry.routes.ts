import { Route } from '@angular/router';
import { ReportDesigner } from '../features/report-designer/report-designer';
import { AuditLogs } from '../features/audit-logs/audit-logs';

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'designer', pathMatch: 'full' },
  { path: 'designer', component: ReportDesigner },
  { path: 'logs', component: AuditLogs },
];
