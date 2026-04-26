import { Component, inject, signal, OnInit, input, output, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, KeycloakRole } from '@cgomanager/shared-data-access';

@Component({
  selector: 'cgo-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.html',
  styleUrl: './role-selector.css',
})
export class RoleSelectorComponent implements OnInit {
  private api = inject(ApiService);
  private el = inject(ElementRef);

  selectedRoles = input<string[]>([]);
  allowedFilter = input<string[] | null>(null);
  placeholder = input<string>('Select roles...');
  
  // If true, shows as a dropdown/combobox. If false, shows as static list.
  dropdownMode = input<boolean>(true);
  
  change = output<string[]>();

  isOpen = signal(false);
  availableRoles = signal<KeycloakRole[]>([]);
  
  filteredAvailable = computed(() => {
    const filter = this.allowedFilter();
    const all = this.availableRoles();
    if (!filter) return all;
    return all.filter(r => filter.includes(r.name));
  });

  realmRoles = computed(() => this.filteredAvailable().filter(r => r.level === 'realm'));
  clientRoles = computed(() => this.filteredAvailable().filter(r => r.level === 'client'));

  localSelected = signal<string[]>([]);

  ngOnInit() {
    this.localSelected.set([...this.selectedRoles()]);
    this.loadRoles();
  }

  loadRoles() {
    this.api.getAvailableRoles().subscribe(roles => {
      this.availableRoles.set(roles);
    });
  }

  isRoleSelected(name: string): boolean {
    return this.localSelected().includes(name);
  }

  toggleRole(name: string, event: Event) {
    event.stopPropagation();
    const current = this.localSelected();
    let next: string[];
    if (current.includes(name)) {
      next = current.filter(r => r !== name);
    } else {
      next = [...current, name];
    }
    this.localSelected.set(next);
    this.change.emit(next);
  }

  toggleDropdown() {
    if (this.dropdownMode()) {
      this.isOpen.update(v => !v);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  getSelectedLabel(): string {
    const selected = this.localSelected();
    if (selected.length === 0) return this.placeholder();
    if (selected.length === 1) return selected[0];
    return `${selected.length} roles selected`;
  }
}
