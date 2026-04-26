import { Component, inject, signal, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ToastService } from '@cgomanager/shared-data-access';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cgo-profile-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './profile-modal.html',
  styleUrl: './profile-modal.css',
})
export class ProfileModalComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  user = input<any>();
  close = output<void>();

  avatarPreview = signal<string | null>(null);
  isSaving = signal(false);

  ngOnInit() {
    this.avatarPreview.set(this.user()?.avatar || null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      this.toast.error('Only JPEG or PNG images are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 50 || img.height !== 50) {
          this.toast.error('Image must be exactly 50x50 pixels');
          return;
        }
        this.avatarPreview.set(e.target.result);
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    const avatar = this.avatarPreview();
    if (!avatar) return;

    this.isSaving.set(true);
    this.api.updateMyAvatar(avatar).subscribe({
      next: () => {
        this.toast.success('Avatar updated successfully');
        this.isSaving.set(false);
        this.close.emit();
        // Notify parent or reload to sync Topbar
        setTimeout(() => window.location.reload(), 1000);
      },
      error: () => {
        this.toast.error('Error updating avatar');
        this.isSaving.set(false);
      }
    });
  }
}
