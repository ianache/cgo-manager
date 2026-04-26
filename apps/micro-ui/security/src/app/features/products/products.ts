import { Component, OnInit, signal, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent, 
  TranslationModalComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, Product, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('nameCellTpl') nameCellTpl!: TemplateRef<any>;
  @ViewChild('iconCellTpl') iconCellTpl!: TemplateRef<any>;
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  products = signal<Product[]>([]);
  columns: PaginatedTableColumn[] = [
    { key: 'name', label: 'PRODUCT NAME', type: 'custom' },
    { key: 'icon', label: 'ICON', type: 'custom' },
    { key: 'is_active', label: 'STATUS', type: 'custom' },
  ];
  customTemplates: { [key: string]: TemplateRef<any> } = {};

  // Form State
  showForm = signal(false);
  isEdit = signal(false);
  productForm: FormGroup;
  
  // Translation Modal State
  showTranslationModal = signal(false);
  translationTarget: 'name' | 'description' = 'name';

  constructor() {
    this.productForm = this.fb.group({
      id: [null],
      name: [{}, Validators.required],
      description: [{}],
      icon: [''],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadProducts();
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

  loadProducts() {
    this.api.getProducts().subscribe(data => this.products.set(data));
  }

  openCreate() {
    this.isEdit.set(false);
    this.productForm.reset({ name: {}, description: {}, is_active: true });
    this.showForm.set(true);
  }

  openEdit(product: Product) {
    this.isEdit.set(true);
    this.productForm.patchValue(product);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  viewModules(product: Product) {
    // Navigate to modules management. 
    // We could pass the product ID as a query param to filter if implemented.
    this.router.navigate(['/security/modules'], { queryParams: { product_id: product.id } });
  }

  openTranslation(target: 'name' | 'description') {
    this.translationTarget = target;
    this.showTranslationModal.set(true);
  }

  saveTranslations(translations: Record<string, string>) {
    this.productForm.get(this.translationTarget)?.setValue(translations);
    this.showTranslationModal.set(false);
  }

  getTranslationPreview(field: 'name' | 'description'): string {
    const data = this.productForm.get(field)?.value || {};
    return data['es'] || data['en'] || '(No translations)';
  }

  saveProduct() {
    if (this.productForm.valid) {
      const data = this.productForm.value;
      const request = this.isEdit() 
        ? this.api.updateProduct(data.id, data)
        : this.api.createProduct(data);

      request.subscribe({
        next: () => {
          this.toast.success(this.isEdit() ? 'Producto actualizado' : 'Producto creado');
          this.loadProducts();
          this.closeForm();
        },
        error: () => this.toast.error('Error al guardar producto')
      });
    }
  }
}
