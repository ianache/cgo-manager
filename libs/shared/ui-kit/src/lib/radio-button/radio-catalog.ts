import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonComponent } from './radio-button';
import { RadioGroupComponent } from './radio-group';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cgo-radio-catalog',
  standalone: true,
  imports: [CommonModule, RadioButtonComponent, RadioGroupComponent, FormsModule],
  template: `
    <div class="catalog-container">
      <h2 class="catalog-title">Round Radio Button States Catalog</h2>
      
      <section class="state-section">
        <h3 class="state-label">Individual States</h3>
        <div class="state-row">
          <div class="state-item">
            <span class="state-desc">Unselected</span>
            <cgo-radio-button label="Option 1" [checked]="false"></cgo-radio-button>
          </div>
          <div class="state-item">
            <span class="state-desc">Selected</span>
            <cgo-radio-button label="Option 2" [checked]="true"></cgo-radio-button>
          </div>
          <div class="state-item">
            <span class="state-desc">Disabled</span>
            <cgo-radio-button label="Option 3" [disabled]="true"></cgo-radio-button>
          </div>
          <div class="state-item">
            <span class="state-desc">Disabled Selected</span>
            <cgo-radio-button label="Option 4" [disabled]="true" [checked]="true"></cgo-radio-button>
          </div>
        </div>
      </section>

      <section class="state-section">
        <h3 class="state-label">Radio Group (Functional)</h3>
        <div class="state-row">
          <cgo-radio-group [(ngModel)]="selectedVal" name="example-group">
            <cgo-radio-button value="A" label="Value A"></cgo-radio-button>
            <cgo-radio-button value="B" label="Value B"></cgo-radio-button>
            <cgo-radio-button value="C" label="Value C"></cgo-radio-button>
          </cgo-radio-group>
          <div class="selected-debug">Selected: {{ selectedVal }}</div>
        </div>
      </section>

      <section class="state-section">
        <h3 class="state-label">Vertical Layout</h3>
        <cgo-radio-group direction="vertical" [(ngModel)]="selectedVal2">
          <cgo-radio-button value="1" label="Step 1: Authorization"></cgo-radio-button>
          <cgo-radio-button value="2" label="Step 2: Verification"></cgo-radio-button>
          <cgo-radio-button value="3" label="Step 3: Deployment"></cgo-radio-button>
        </cgo-radio-group>
      </section>
    </div>
  `,
  styles: [`
    .catalog-container {
      padding: 32px;
      background: #f8f9fa;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
    }
    .catalog-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 24px;
      color: #191c1d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .state-section {
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .state-label {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #bb0012;
      margin-bottom: 16px;
    }
    .state-row {
      display: flex;
      gap: 32px;
      align-items: center;
    }
    .state-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .state-desc {
      font-size: 0.75rem;
      font-weight: 600;
      color: #506169;
    }
    .selected-debug {
      font-size: 0.75rem;
      font-weight: 700;
      color: #bb0012;
      background: rgba(187,0,18,0.05);
      padding: 4px 12px;
      border-radius: 4px;
    }
  `]
})
export class RadioCatalogComponent {
  selectedVal = 'B';
  selectedVal2 = '1';
}
