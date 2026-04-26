import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, ReportDefinition } from '@cgomanager/shared-data-access';

@Component({
  selector: 'app-visual-designer',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule
  ],
  templateUrl: './visual-designer.html',
  styleUrl: './visual-designer.css',
})
export class VisualDesignerComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reportId = signal<string | null>(null);
  report = signal<ReportDefinition | null>(null);
  
  // AI Prompt
  aiPrompt = signal('');
  isGenerating = signal(false);

  // Mock visual elements
  canvasElements = signal<any[]>([
    { type: 'header', content: 'Operational Report Snapshot', x: 50, y: 50 },
    { type: 'chart', kind: 'bar', x: 50, y: 120, width: 600, height: 300 },
    { type: 'table', x: 50, y: 450, width: 800, height: 200 }
  ]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId.set(id);
      this.loadReport(id);
    }
  }

  loadReport(id: string) {
    this.api.getReportById(id).subscribe({
      next: (data) => this.report.set(data),
      error: (err) => console.error('Error loading report', err)
    });
  }

  onAIPromptSubmit() {
    if (!this.aiPrompt().trim()) return;
    
    this.isGenerating.set(true);
    // Simulate AI generation
    setTimeout(() => {
      alert('AI Agent is processing: ' + this.aiPrompt());
      this.isGenerating.set(false);
      this.aiPrompt.set('');
    }, 2000);
  }

  saveLayout() {
    alert('Visual Layout saved successfully');
  }

  exportReport() {
    alert('Exporting report based on visual design...');
  }
}
