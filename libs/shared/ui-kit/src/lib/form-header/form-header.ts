import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-form-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-header.html',
  styleUrl: './form-header.css',
})
export class FormHeaderComponent {
  @Input() title = '';
  @Input() description = '';
}
