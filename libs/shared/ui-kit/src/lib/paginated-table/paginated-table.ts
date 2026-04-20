import { Component, Input, ContentChild, TemplateRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent } from '../base-table/base-table';

@Component({
  selector: 'cgo-paginated-table',
  standalone: true,
  imports: [CommonModule, BaseTableComponent],
  templateUrl: './paginated-table.html',
  styleUrl: './paginated-table.css',
})
export class PaginatedTableComponent implements OnInit, OnChanges {
  protected readonly Math = Math;
  @Input() columns: { key: string; label: string; type?: 'image' | 'link' | 'badges' }[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 10;
  @Input() showActions = false;

  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;
  @ContentChild('statusTemplate') statusTemplate?: TemplateRef<any>;

  currentPage = 1;
  totalPages = 1;
  paginatedData: any[] = [];

  ngOnInit(): void {
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.updatePagination();
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.data.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.data.slice(start, end);
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
