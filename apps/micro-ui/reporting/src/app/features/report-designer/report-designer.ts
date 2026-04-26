import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, ReportDefinition, DataSource } from '@cgomanager/shared-data-access';
import { 
  ButtonComponent, 
  FormHeaderComponent,
  CheckboxComponent
} from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-report-designer',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonComponent,
    FormHeaderComponent,
    CheckboxComponent
  ],
  templateUrl: './report-designer.html',
  styleUrl: './report-designer.css',
})
export class ReportDesigner implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reportForm: FormGroup;
  currentStep = signal(1);
  reportId = signal<string | null>(null);
  dataSources = signal<DataSource[]>([]);

  // Mock data for designer options
  availableMeasures = ['Total Sales', 'Unit Count', 'Avg Price', 'Distance km', 'Fuel Usage'];
  availableDimensions = ['Date', 'Product', 'Region', 'Tenant', 'Manufacturer'];

  constructor() {
    this.reportForm = this.fb.group({
      name: ['', Validators.required],
      cube_name: ['', Validators.required],
      data_source_id: ['', Validators.required],
      format: ['xlsx', Validators.required],
      measures: [[]],
      dimensions: [[]],
      filters: [[]],
      delivery: this.fb.group({
        channel: ['email'],
        destination: ['', Validators.email]
      })
    });
  }

  ngOnInit() {
    this.api.getDataSources().subscribe(ds => this.dataSources.set(ds));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId.set(id);
      this.api.getReportById(id).subscribe({
        next: (report) => {
          this.reportForm.patchValue({
            name: report.name,
            cube_name: report.cube_name,
            data_source_id: report.data_source_id,
            format: report.format,
            measures: report.measures,
            dimensions: report.dimensions,
            filters: report.filters,
            delivery: report.delivery_json || { channel: 'email', destination: '' }
          });
        },
        error: (err) => console.error('Error loading report', err)
      });
    }
  }

  nextStep() {
    if (this.currentStep() < 3) this.currentStep.update(s => s + 1);
  }

  prevStep() {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  toggleSelection(list: string[], item: string) {
    const idx = list.indexOf(item);
    if (idx > -1) list.splice(idx, 1);
    else list.push(item);
  }

  saveReport() {
    if (this.reportForm.valid) {
      const id = this.reportId();
      const report: ReportDefinition = {
        name: this.reportForm.value.name!,
        cube_name: this.reportForm.value.cube_name!,
        data_source_id: this.reportForm.value.data_source_id!,
        format: this.reportForm.value.format! as any,
        measures: this.reportForm.value.measures!,
        dimensions: this.reportForm.value.dimensions!,
        filters: this.reportForm.value.filters!,
        delivery_json: this.reportForm.value.delivery!
      };

      const request = id 
        ? this.api.updateReport(id, report) 
        : this.api.createReport(report);

      request.subscribe({
        next: () => {
          alert(id ? 'Reporte actualizado con éxito' : 'Reporte guardado con éxito');
          this.router.navigate(['../dashboards'], { relativeTo: this.route });
        },
        error: (err) => console.error('Error al guardar reporte', err)
      });
    }
  }
}
