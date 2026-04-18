import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, ReportDefinition } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-report-designer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './report-designer.html',
  styleUrl: './report-designer.css',
})
export class ReportDesigner {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  currentStep = signal(1);
  
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

  toggleMeasure(measure: string) {
    const current = this.selectedMeasures();
    if (current.includes(measure)) {
      this.selectedMeasures.set(current.filter(m => m !== measure));
    } else {
      this.selectedMeasures.set([...current, measure]);
    }
  }

  toggleDimension(dimension: string) {
    const current = this.selectedDimensions();
    if (current.includes(dimension)) {
      this.selectedDimensions.set(current.filter(d => d !== dimension));
    } else {
      this.selectedDimensions.set([...current, dimension]);
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

      this.api.createReport(report).subscribe({
        next: () => {
          alert('Reporte guardado con éxito');
          this.reportForm.reset();
          this.selectedMeasures.set([]);
          this.selectedDimensions.set([]);
          this.currentStep.set(1);
        },
        error: (err) => console.error('Error al guardar reporte', err)
      });
    }
  }
}
