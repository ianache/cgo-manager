import { Component, OnInit, signal, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent, 
  TranslationModalComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, Module, Product, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PaginatedTableComponent, 
    FormHeaderComponent, 
    ButtonComponent,
    TranslationModalComponent
  ],
  templateUrl: './modules.html',
  styleUrl: './modules.css',
})
export class ModulesComponent implements OnInit, AfterViewInit {
  @ViewChild('nameCellTpl') nameCellTpl!: TemplateRef<any>;
  @ViewChild('iconCellTpl') iconCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  modules = signal<Module[]>([]);
  products = signal<Product[]>([]);
  
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'MODULE NAME', type: 'custom' },
    { key: 'product', label: 'PARENT PRODUCT', type: 'custom' },
    { key: 'icon', label: 'ICON', type: 'custom' },
    { key: 'is_active', label: 'STATUS', type: 'custom' },
  ];
  customTemplates: { [key: string]: TemplateRef<any> } = {};

  showForm = signal(false);
  isEdit = signal(false);
  moduleForm: FormGroup;
  showTranslationModal = signal(false);
  translationTarget: 'name' | 'description' = 'name';

  constructor() {
    this.moduleForm = this.fb.group({
      id: [null],
      product_id: ['', Validators.required],
      name: [{}, Validators.required],
      description: [{}],
      icon: [''],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.route.queryParams.subscribe(params => {
      const productId = params['product_id'];
      this.loadModules(productId);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        name: this.nameCellTpl,
        product: this.nameCellTpl, // Reusing same logic for product name
        icon: this.iconCellTpl,
        is_active: this.statusCellTpl
      };
    });
  }

  loadModules(productId?: string) {
    this.api.getModules(productId).subscribe(data => this.modules.set(data));
  }

  loadProducts() {
    this.api.getProducts().subscribe(data => this.products.set(data));
  }

  openCreate() {
    this.isEdit.set(false);
    this.moduleForm.reset({ product_id: '', name: {}, description: {}, is_active: true });
    this.showForm.set(true);
  }

  openEdit(mod: Module) {
    this.isEdit.set(true);
    this.moduleForm.patchValue(mod);
    this.showForm.set(true);
  }

  saveModule() {
    if (this.moduleForm.valid) {
      const data = this.moduleForm.value;
      const request = this.isEdit() 
        ? this.api.updateModule(data.id, data)
        : this.api.createModule(data);

      request.subscribe({
        next: () => {
          this.toast.success(this.isEdit() ? 'Módulo actualizado' : 'Módulo creado');
          this.loadModules();
          this.showForm.set(false);
        },
        error: () => this.toast.error('Error al guardar módulo')
      });
    }
  }

  viewFeatures(mod: Module) {
    this.router.navigate(['/security/features'], { queryParams: { module_id: mod.id } });
  }

  getTranslationPreview(field: 'name' | 'description'): string {
    const data = this.moduleForm.get(field)?.value || {};
    return data['es'] || data['en'] || '(No translations)';
  }
}
