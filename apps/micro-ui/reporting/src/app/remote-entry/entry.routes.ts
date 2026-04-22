import { Route } from '@angular/router';
import { DashboardsComponent } from '../features/dashboards/dashboards.component';
import { ReportBuilderComponent } from '../features/report-builder/report-builder.component';
import { ScheduledTasksComponent } from '../features/scheduled-tasks/scheduled-tasks.component';
import { ScheduleTaskFormComponent } from '../features/scheduled-tasks/schedule-task-form.component';
import { ReportDesigner } from '../features/report-designer/report-designer';
import { AuditLogs } from '../features/audit-logs/audit-logs';
import { DataSourcesComponent } from '../features/data-sources/data-sources.component';
import { DataSourceFormComponent } from '../features/data-sources/data-source-form.component';
import { DataSourceTestResultComponent } from '../features/data-sources/data-source-test-result.component';

export const remoteRoutes: Route[] = [
  { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
  { path: 'dashboards', component: DashboardsComponent },
  { path: 'data-sources', component: DataSourcesComponent },
  { path: 'data-sources/create', component: DataSourceFormComponent },
  { path: 'data-sources/edit/:id', component: DataSourceFormComponent },
  { path: 'data-sources/test-result', component: DataSourceTestResultComponent },
  { path: 'builder', component: ReportBuilderComponent },
  { path: 'scheduled-tasks', component: ScheduledTasksComponent },
  { path: 'scheduled-tasks/create', component: ScheduleTaskFormComponent },
  { path: 'designer', component: ReportDesigner },
  { path: 'designer/:id', component: ReportDesigner },
  { path: 'logs', component: AuditLogs },
];
