import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from '../checkbox/checkbox.component';

export interface RoleData {
  name: string;
  description: string;
  icon: string;
  iconBg?: string;
  userCount: number;
}

@Component({
  selector: 'cgo-card-role',
  standalone: true,
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './card-role.html',
  styleUrl: './card-role.css',
})
export class CardRoleComponent {
  @Input() role!: RoleData;
  @Input() isSelected = false;
  @Output() selectRole = new EventEmitter<void>();
}
