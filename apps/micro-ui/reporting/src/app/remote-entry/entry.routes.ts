import { Route } from '@angular/router';
import { DashboardsComponent } from '../features/dashboards/dashboards.component';
import { ReportBuilderComponent } from '../features/report-builder/report-builder.component';
import { ScheduledTasksComponent } from '../features/scheduled-tasks/scheduled-tasks.component';
import { ScheduleTaskFormComponent } from '../features/scheduled-tasks/schedule-task-form.component';
import { ReportDesigner } from '../features/report-designer/report-designer';
import { AuditLogs } from '../features/audit-logs/audit-logs';

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
  { path: 'dashboards', component: DashboardsComponent },
  { path: 'builder', component: ReportBuilderComponent },
  { path: 'scheduled-tasks', component: ScheduledTasksComponent },
  { path: 'scheduled-tasks/create', component: ScheduleTaskFormComponent },
  { path: 'designer', component: ReportDesigner },
  { path: 'logs', component: AuditLogs },
];
