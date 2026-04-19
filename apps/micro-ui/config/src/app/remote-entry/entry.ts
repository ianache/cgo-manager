import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, FormHeaderComponent } from '@cgomanager/shared-ui-kit';

@Component({
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormHeaderComponent],
  selector: 'app-config-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class RemoteEntryComponent {
  branding = {
    primaryColor: '#bb0012',
    secondaryColor: '#506169',
    tenantName: 'SkyNet Logistics'
  };
}
