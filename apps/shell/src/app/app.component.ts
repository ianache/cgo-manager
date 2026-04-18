import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent, TopbarComponent } from '@cgomanager/shared-ui-kit';

@Component({
  imports: [RouterModule, SidebarComponent, TopbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'shell';
}
