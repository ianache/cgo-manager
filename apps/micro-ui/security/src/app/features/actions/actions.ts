import { Component, OnInit, signal, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent, 
  TranslationModalComponent,
  RoleSelectorComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, Action, Feature, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PaginatedTableComponent, 
    FormHeaderComponent, 
    ButtonComponent,
    TranslationModalComponent,
    RoleSelectorComponent
  ],
  templateUrl: './actions.html',
  styleUrl: './actions.css',
})
export class ActionsComponent implements OnInit, AfterViewInit {
  @ViewChild('nameCellTpl') nameCellTpl!: TemplateRef<any>;
  @ViewChild('iconCellTpl') iconCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  actions = signal<Action[]>([]);
  features = signal<Feature[]>([]);
  
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'ACTION NAME', type: 'custom' },
    { key: 'feature', label: 'PARENT FEATURE' },
    { key: 'icon', label: 'ICON', type: 'custom' },
    { key: 'is_active', label: 'STATUS', type: 'custom' },
  ];
  customTemplates: { [key: string]: TemplateRef<any> } = {};

  showForm = signal(false);
  actionForm: FormGroup;
  showTranslationModal = signal(false);
  translationTarget: 'name' | 'description' = 'name';

  constructor() {
    this.actionForm = this.fb.group({
      id: [null],
      feature_id: ['', Validators.required],
      name: [{}, Validators.required],
      description: [{}],
      icon: [''],
      is_active: [true],
      allowed_roles: [[]]
    });
  }

  ngOnInit() {
    this.loadActions();
    this.loadFeatures();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        name: this.nameCellTpl,
        icon: this.iconCellTpl,
        is_active: this.statusCellTpl
      };
    });
  }

  loadActions() {
    this.api.getActions().subscribe(data => this.actions.set(data));
  }

  loadFeatures() {
    this.api.getFeatures().subscribe(data => this.features.set(data));
  }

  openCreate() {
    this.actionForm.reset({ feature_id: '', name: {}, description: {}, is_active: true, allowed_roles: [] });
    this.showForm.set(true);
  }

  saveAction() {
    if (this.actionForm.valid) {
      this.api.createAction(this.actionForm.value).subscribe({
        next: () => {
          this.toast.success('Acción guardada');
          this.loadActions();
          this.showForm.set(false);
        },
        error: () => this.toast.error('Error al guardar acción')
      });
    }
  }

  getTranslationPreview(field: 'name' | 'description'): string {
    const data = this.actionForm.get(field)?.value || {};
    return data['es'] || data['en'] || '(No translations)';
  }

  onRolesChange(roles: string[]) {
    this.actionForm.get('allowed_roles')?.setValue(roles);
  }
}
