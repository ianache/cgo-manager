import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent, TopbarComponent, ToastComponent } from '@cgomanager/shared-ui-kit';

@Component({
  imports: [RouterModule, SidebarComponent, TopbarComponent, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'shell';
}
