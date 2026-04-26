import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cgo-logout-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './logout-modal.html',
  styleUrl: './logout-modal.css',
})
export class LogoutModalComponent {
  close = output<void>();

  confirm() {
    window.location.href = 'http://localhost:3000/api/auth/logout';
  }
}
