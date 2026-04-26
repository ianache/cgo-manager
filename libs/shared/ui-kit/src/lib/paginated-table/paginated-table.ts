import { Component, Input, ContentChild, TemplateRef, OnInit, OnChanges, SimpleChanges, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseTableComponent } from '../base-table/base-table';

export interface PaginatedTableColumn {
  key: string;
  label: string;
  type?: 'image' | 'link' | 'badges' | 'checkbox' | 'custom';
}

@Component({
  selector: 'cgo-paginated-table',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseTableComponent],
  templateUrl: './paginated-table.html',
  styleUrl: './paginated-table.css',
})
export class PaginatedTableComponent implements OnInit, OnChanges {
  protected readonly Math = Math;
  @Input() columns: PaginatedTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 10;
  @Input() showActions = false;
  
  // Header options
  @Input() showHeader = false;
  @Input() headerTitle = '';
  @Input() headerDescription = '';
  @Input() showHeaderSearch = false;

  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;
  @ContentChild('headerActions') headerActions?: TemplateRef<any>;
  
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {};

  currentPage = 1;
  totalPages = 1;
  paginatedData: any[] = [];
  searchQuery = signal('');

  constructor() {
    effect(() => {
      this.searchQuery();
      this.currentPage = 1;
      this.updatePagination();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.updatePagination();
    }
  }

  updatePagination(): void {
    let filteredData = this.data;
    const query = this.searchQuery().toLowerCase();
    
    if (query) {
      filteredData = this.data.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }

    this.totalPages = Math.ceil(filteredData.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = filteredData.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  get pages(): number[] {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
    return range;
  }
}
