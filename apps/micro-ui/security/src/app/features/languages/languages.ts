import { Component, OnInit, signal, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  PaginatedTableComponent, 
  FormHeaderComponent, 
  ButtonComponent,
  PaginatedTableColumn
} from '@cgomanager/shared-ui-kit';
import { ApiService, Language, ToastService } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PaginatedTableComponent, 
    FormHeaderComponent, 
    ButtonComponent
  ],
  templateUrl: './languages.html',
  styleUrl: './languages.css',
})
export class LanguagesComponent implements OnInit, AfterViewInit {
  @ViewChild('statusCellTpl') statusCellTpl!: TemplateRef<any>;

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  languages = signal<Language[]>([]);
  columns: PaginatedTableColumn[] = [
    { key: 'iso_code', label: 'ISO CODE' },
    { key: 'name', label: 'NAME' },
    { key: 'is_active', label: 'STATUS', type: 'custom' }
  ];
  customTemplates: { [key: string]: TemplateRef<any> } = {};

  showForm = signal(false);
  langForm: FormGroup;

  constructor() {
    this.langForm = this.fb.group({
      iso_code: ['', [Validators.required, Validators.maxLength(5)]],
      name: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadLanguages();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.customTemplates = {
        is_active: this.statusCellTpl
      };
    });
  }

  loadLanguages() {
    this.api.getLanguages().subscribe(data => this.languages.set(data));
  }

  openCreate() {
    this.langForm.reset({ is_active: true });
    this.showForm.set(true);
  }

  saveLanguage() {
    if (this.langForm.valid) {
      this.api.createLanguage(this.langForm.value).subscribe({
        next: () => {
          this.toast.success('Idioma añadido');
          this.loadLanguages();
          this.showForm.set(false);
        },
        error: () => this.toast.error('Error al añadir idioma')
      });
    }
  }
}
