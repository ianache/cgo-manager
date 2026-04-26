import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, DataSource, ToastService } from '@cgomanager/shared-data-access';
import { 
  ButtonComponent, 
  FormHeaderComponent,
  CheckboxComponent
} from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-data-source-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule,
    ButtonComponent,
    FormHeaderComponent,
    CheckboxComponent
  ],
  templateUrl: './data-source-form.html',
  styles: [`
    .ds-form-page { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
    
    .ds-layout { 
      display: grid; 
      grid-template-columns: 1fr 360px; 
      gap: 32px; 
    }

    .ds-main-form {
      background: white;
      border-radius: 8px;
      padding: 40px;
    }

    .cloud-shadow { box-shadow: 0 12px 32px rgba(25,28,29,0.04), 0 4px 8px rgba(25,28,29,0.02); }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .full-width { grid-column: span 2; }
    .form-field { display: flex; flex-direction: column; gap: 8px; }
    .form-field label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--secondary-grey); }
    .form-field input, .form-field select, .form-field textarea {
      padding: 12px 16px;
      background: var(--surface-light);
      border: 1px solid #e1e3e4;
      border-radius: 4px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #bb0012; background: white; }
    .field-hint { font-size: 0.75rem; color: #b8c9d3; }

    .form-section { margin-top: 48px; padding-top: 32px; border-top: 1px solid #edeeef; display: flex; flex-direction: column; gap: 24px; }
    .section-title { font-size: 1rem; font-weight: 700; margin: 0; color: #191c1d; }

    .ds-form-footer { 
      margin-top: 48px; 
      padding-top: 32px; 
      border-top: 1px solid #edeeef; 
      display: flex; 
      justify-content: space-between;
      align-items: center;
    }
    .footer-right { display: flex; gap: 16px; }

    .ds-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .info-card, .help-card { background: white; padding: 24px; border-radius: 8px; }
    .info-card h4, .help-card h4 { margin: 0 0 16px 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #506169; }
    
    .status-indicator { display: flex; align-items: center; gap: 12px; }
    .pulse { width: 12px; height: 12px; border-radius: 50%; background: #43a047; box-shadow: 0 0 0 rgba(67,160,71, 0.4); animation: pulse 2s infinite; }
    .pulse.inactive { background: #b8c9d3; animation: none; }
    .preview-value { font-weight: 700; color: #1b5e20; }
    .preview-value.inactive { color: #506169; }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(67,160,71, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(67,160,71, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(67,160,71, 0); }
    }

    .help-card p { font-size: 0.875rem; color: #506169; line-height: 1.6; margin-bottom: 16px; }
    .help-card a { font-size: 0.875rem; color: #bb0012; font-weight: 700; text-decoration: none; }
  `]
})
export class DataSourceFormComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  dsForm: FormGroup;
  isEdit = false;

  constructor() {
    this.dsForm = this.fb.group({
      name: ['', Validators.required],
      type: ['cube', Validators.required],
      connection_string: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.api.getDataSourceById(id).subscribe(ds => {
        this.dsForm.patchValue(ds);
      });
    }
  }

  save() {
    if (this.dsForm.valid) {
      const id = this.route.snapshot.paramMap.get('id');
      const data = this.dsForm.value;
      const request = id ? this.api.updateDataSource(id, data) : this.api.createDataSource(data);

      request.subscribe({
        next: () => {
          this.toast.success(id ? 'Data Source actualizada' : 'Data Source creada');
          const target = id ? '../../' : '../';
          this.router.navigate([target], { relativeTo: this.route });
        },
        error: (err) => {
          console.error('Error saving data source', err);
          this.toast.error('Error al guardar la Data Source');
        }
      });
    }
  }
}
