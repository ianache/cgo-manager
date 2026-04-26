import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Language } from '@cgomanager/shared-data-access';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cgo-translation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './translation-modal.html',
  styleUrl: './translation-modal.css',
})
export class TranslationModalComponent implements OnInit {
  private api = inject(ApiService);

  title = input<string>('Edit Translations');
  // Record<iso_code, value>
  data = input<Record<string, string>>({});
  
  save = output<Record<string, string>>();
  close = output<void>();

  languages = signal<Language[]>([]);
  // Local state for editing
  localData = signal<Record<string, string>>({});

  ngOnInit() {
    this.localData.set({ ...this.data() });
    this.loadLanguages();
  }

  loadLanguages() {
    this.api.getLanguages().subscribe(langs => {
      this.languages.set(langs);
      // Ensure all languages have an entry in localData
      const current = { ...this.localData() };
      langs.forEach(l => {
        if (current[l.iso_code] === undefined) {
          current[l.iso_code] = '';
        }
      });
      this.localData.set(current);
    });
  }

  updateValue(iso: string, value: string) {
    this.localData.update(d => ({ ...d, [iso]: value }));
  }

  onSave() {
    this.save.emit(this.localData());
  }

  onCancel() {
    this.close.emit();
  }
}
