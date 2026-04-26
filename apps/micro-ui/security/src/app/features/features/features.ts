import { Component, OnInit, signal, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent, 
  TranslationModalComponent,
  RoleSelectorComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, Feature, Module, Action, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-features',
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
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class FeaturesComponent implements OnInit, AfterViewInit {
  @ViewChild('nameCellTpl') nameCellTpl!: TemplateRef<any>;
  @ViewChild('iconCellTpl') iconCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;
  @ViewChild('actionStatusCellTpl') actionStatusCellTpl!: TemplateRef<any>;
  @ViewChild('actionRolesCellTpl') actionRolesCellTpl!: TemplateRef<any>;
  @ViewChild('actionTableActionsTpl') actionTableActionsTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  features = signal<Feature[]>([]);
  modules = signal<Module[]>([]);
  
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'FEATURE NAME', type: 'custom' },
    { key: 'module', label: 'PARENT MODULE', type: 'custom' },
    { key: 'icon', label: 'ICON', type: 'custom' },
    { key: 'is_active', label: 'STATUS', type: 'custom' },
  ];

  actionColumns: PaginatedTableColumn[] = [
    { key: 'name', label: 'ACTION NAME', type: 'custom' },
    { key: 'is_active', label: 'STATUS', type: 'custom' },
    { key: 'allowed_roles', label: 'PERMISSIONS', type: 'custom' }
  ];

  customTemplates: { [key: string]: TemplateRef<any> } = {};

  // Form State
  showForm = signal(false);
  isEdit = signal(false);
  featureForm: FormGroup;
  
  // Translation Modal State
  showTranslationModal = signal(false);
  translationTarget: 'name' | 'description' = 'name';

  // Actions Manager State
  showActionsManager = signal(false);
  selectedFeature = signal<Feature | null>(null);
  
  // Local list to track uncommitted changes
  localActions = signal<any[]>([]);
  newActionName = signal('');
  newActionRoles = signal<string[]>([]);
  editingActionId = signal<string | null>(null);
  isUpdatingActions = signal(false);

  constructor() {
    this.featureForm = this.fb.group({
      id: [null],
      module_id: ['', Validators.required],
      name: [{}, Validators.required],
      description: [{}],
      icon: [''],
      is_active: [true],
      allowed_roles: [[]]
    });
  }

  ngOnInit() {
    this.loadModules();
    this.route.queryParams.subscribe(params => {
      const moduleId = params['module_id'];
      this.loadFeatures(moduleId);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        name: this.nameCellTpl,
        module: this.nameCellTpl, 
        icon: this.iconCellTpl,
        is_active: this.statusCellTpl,
        actionStatus: this.actionStatusCellTpl,
        allowed_roles: this.actionRolesCellTpl,
        actions: this.actionTableActionsTpl
      };
    });
  }

  loadFeatures(moduleId?: string) {
    this.api.getFeatures(moduleId).subscribe(data => this.features.set(data));
  }

  loadModules() {
    this.api.getModules().subscribe(data => this.modules.set(data));
  }

  openCreate() {
    this.isEdit.set(false);
    this.featureForm.reset({ module_id: '', name: {}, description: {}, is_active: true, allowed_roles: [] });
    this.showForm.set(true);
  }

  openEdit(feat: Feature) {
    this.isEdit.set(true);
    this.featureForm.patchValue(feat);
    this.showForm.set(true);
  }

  saveFeature() {
    if (this.featureForm.valid) {
      const data = this.featureForm.value;
      const request = this.isEdit() 
        ? this.api.updateFeature(data.id, data)
        : this.api.createFeature(data);

      request.subscribe({
        next: () => {
          this.toast.success(this.isEdit() ? 'Funcionalidad actualizada' : 'Funcionalidad creada');
          this.loadFeatures();
          this.showForm.set(false);
        },
        error: () => this.toast.error('Error al guardar funcionalidad')
      });
    }
  }

  // --- Actions Manager ---

  openActionsManager(feat: Feature) {
    this.selectedFeature.set(feat);
    this.api.getActions(feat.id).subscribe(actions => {
      this.localActions.set(actions.map(a => ({ ...a, is_dirty: false, is_new: false })));
      this.showActionsManager.set(true);
      this.resetActionBar();
    });
  }

  resetActionBar() {
    this.newActionName.set('');
    this.newActionRoles.set([]);
    this.editingActionId.set(null);
  }

  startEditAction(action: any) {
    this.editingActionId.set(action.id);
    this.newActionName.set(action.name['es'] || action.name['en'] || '');
    this.newActionRoles.set([...(action.allowed_roles || [])]);
  }

  saveActionFromBar() {
    const nameStr = this.newActionName().trim();
    if (!nameStr) return;

    const editId = this.editingActionId();
    if (editId) {
      // Update existing local item
      this.localActions.update(actions => actions.map(a => {
        if (a.id === editId) {
          return { 
            ...a, 
            name: { ...a.name, es: nameStr, en: nameStr }, 
            allowed_roles: [...this.newActionRoles()],
            is_dirty: true 
          };
        }
        return a;
      }));
      this.toast.success('Cambios aplicados localmente');
    } else {
      // Add new
      const feat = this.selectedFeature();
      if (!feat) return;

      const newAction = {
        id: `temp-${Date.now()}`,
        feature_id: feat.id,
        name: { es: nameStr, en: nameStr }, 
        is_active: true,
        allowed_roles: [...this.newActionRoles()],
        is_new: true,
        is_dirty: true
      };
      this.localActions.update(current => [newAction, ...current]);
      this.toast.success('Acción añadida a la lista local');
    }
    this.resetActionBar();
  }

  queueActionStatusToggle(action: any) {
    this.localActions.update(actions => 
      actions.map(a => a.id === action.id ? { ...a, is_active: !a.is_active, is_dirty: true } : a)
    );
  }

  queueActionRolesChange(action: any, roles: string[]) {
    this.localActions.update(actions => 
      actions.map(a => a.id === action.id ? { ...a, allowed_roles: roles, is_dirty: true } : a)
    );
  }

  updateActions() {
    const featureId = this.selectedFeature()?.id;
    if (!featureId) return;

    const changes = this.localActions().filter(a => a.is_dirty);
    if (changes.length === 0) {
      this.showActionsManager.set(false);
      return;
    }

    this.isUpdatingActions.set(true);
    
    const requests = changes.map(a => {
      if (a.is_new) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, is_new, is_dirty, ...cleanData } = a;
        return this.api.createAction(cleanData);
      } else {
        return this.api.updateAction(a.id, {
          name: a.name,
          is_active: a.is_active,
          allowed_roles: a.allowed_roles
        });
      }
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.toast.success('Todas las acciones han sido actualizadas');
        this.isUpdatingActions.set(false);
        this.showActionsManager.set(false);
      },
      error: (err) => {
        console.error('Error batch updating actions', err);
        this.toast.error('Error al actualizar acciones');
        this.isUpdatingActions.set(false);
      }
    });
  }

  getTranslationPreview(field: 'name' | 'description', customData?: any): string {
    const data = customData || this.featureForm.get(field)?.value || {};
    return data['es'] || data['en'] || '(No translations)';
  }

  onRolesChange(roles: string[]) {
    this.featureForm.get('allowed_roles')?.setValue(roles);
  }
}
