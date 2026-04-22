import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ReportDefinition } from '@cgomanager/shared-data-access';
import { 
  ButtonComponent, 
  RadioGroupComponent, 
  RadioButtonComponent,
  CheckboxComponent,
  FormHeaderComponent
} from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-report-designer',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonComponent,
    RadioGroupComponent,
    RadioButtonComponent,
    CheckboxComponent,
    FormHeaderComponent
  ],
  templateUrl: './report-designer.html',
  styleUrl: './report-designer.css',
})
export class ReportDesigner implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentStep = signal(1);
  reportId = signal<string | null>(null);
  
  // Datos simulados (Vendrían del BFF vía Cube API)
  cubes = signal(['Vehicles', 'Fuel', 'Alerts', 'Maintenance']);
  availableMeasures = signal(['Total Distance', 'Avg Speed', 'Idle Time', 'Fuel Consumption']);
  availableDimensions = signal(['Tenant', 'Vehicle Type', 'Route', 'Date']);

  reportForm = this.fb.group({
    name: ['', Validators.required],
    cubeName: ['', Validators.required],
    format: ['xlsx', Validators.required],
    deliveryChannel: ['email', Validators.required],
    destination: ['', Validators.required],
  });

  selectedMeasures = signal<string[]>([]);
  selectedDimensions = signal<string[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId.set(id);
      this.loadReport(id);
    }
  }

  loadReport(id: string) {
    this.api.getReportById(id).subscribe({
      next: (report) => {
        this.reportForm.patchValue({
          name: report.name,
          cubeName: report.cubeName,
          format: report.format,
          deliveryChannel: report.delivery.channel,
          destination: report.delivery.destination
        });
        this.selectedMeasures.set(report.measures);
        this.selectedDimensions.set(report.dimensions);
      },
      error: (err) => console.error('Error loading report', err)
    });
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onMeasureToggle(measure: string, checked: boolean) {
    const current = this.selectedMeasures();
    if (checked) {
      this.selectedMeasures.set([...current, measure]);
    } else {
      this.selectedMeasures.set(current.filter(m => m !== measure));
    }
  }

  onDimensionToggle(dimension: string, checked: boolean) {
    const current = this.selectedDimensions();
    if (checked) {
      this.selectedDimensions.set([...current, dimension]);
    } else {
      this.selectedDimensions.set(current.filter(d => d !== dimension));
    }
  }

  saveReport() {
    if (this.reportForm.valid) {
      const report: ReportDefinition = {
        name: this.reportForm.value.name!,
        cubeName: this.reportForm.value.cubeName!,
        measures: this.selectedMeasures(),
        dimensions: this.selectedDimensions(),
        filters: [],
        format: this.reportForm.value.format as any,
        delivery: {
          channel: this.reportForm.value.deliveryChannel as any,
          destination: this.reportForm.value.destination!,
        }
      };

      const id = this.reportId();
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
