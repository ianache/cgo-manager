import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cgo-generic-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-card.html',
  styleUrl: './generic-card.css',
})
export class GenericCardComponent {
  @Input() clickable = false;
}
