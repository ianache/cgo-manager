import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@cgomanager/shared-data-access';
import { ButtonComponent } from '@cgomanager/shared-ui-kit';

@Component({
  selector: 'app-login-error',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="login-error-page">
      <div class="error-card cloud-shadow">
        <span class="material-symbols-outlined error-icon">gpp_maybe</span>
        <h2>Authentication Failed</h2>
        <p>We were unable to complete your sign-in with Keycloak. This might be due to an expired session or incorrect credentials.</p>
        
        <div class="actions">
          <cgo-button variant="primary" (click)="retry()">
            <span class="material-symbols-outlined">login</span>
            Try Again
          </cgo-button>
          <a href="/" class="back-link">Return to Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-error-page {
      height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }
    .error-card {
      background: white;
      padding: 48px;
      border-radius: 12px;
      text-align: center;
      max-width: 450px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .error-icon {
      font-size: 64px;
      color: #bb0012;
    }
    h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #191c1d; }
    p { color: #506169; line-height: 1.6; margin: 0; }
    .actions { display: flex; flex-direction: column; gap: 16px; width: 100%; margin-top: 12px; }
    .back-link { font-size: 0.875rem; color: #506169; text-decoration: none; font-weight: 600; }
    .back-link:hover { color: #bb0012; }
    .cloud-shadow { box-shadow: 0 24px 48px rgba(25,28,29,0.08); }
  `]
})
export class LoginErrorComponent {
  private api = inject(ApiService);

  retry() {
    this.api.login();
  }
}
