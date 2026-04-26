import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '@cgomanager/shared-data-access';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cgo-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
})
export class SettingsModalComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  user = input<any>();
  close = output<void>();

  permissions = signal<any[]>([]);
  isLoading = signal(true);
  
  newPassword = signal('');
  confirmPassword = signal('');
  isChangingPassword = signal(false);

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.api.getMyPermissions().subscribe({
      next: (data) => {
        this.permissions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error loading permissions');
        this.isLoading.set(false);
      }
    });
  }

  changePassword() {
    if (this.newPassword() !== this.confirmPassword()) {
      this.toast.error('Passwords do not match');
      return;
    }
    if (this.newPassword().length < 8) {
      this.toast.error('Password must be at least 8 characters');
      return;
    }

    this.isChangingPassword.set(true);
    this.api.changeMyPassword(this.newPassword()).subscribe({
      next: () => {
        this.toast.success('Password updated successfully');
        this.isChangingPassword.set(false);
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: () => {
        this.toast.error('Error updating password');
        this.isChangingPassword.set(false);
      }
    });
  }

  getLocalizedValue(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    // We assume user locale is stored in session user
    const locale = this.user()?.locale || 'es';
    return val[locale] || val['en'] || Object.values(val)[0] as string;
  }
}
