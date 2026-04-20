import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-security-entry',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="security-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .security-container {
      padding: 24px;
      height: 100%;
      background-color: var(--surface);
    }
  `]
})
export class RemoteEntry {}
