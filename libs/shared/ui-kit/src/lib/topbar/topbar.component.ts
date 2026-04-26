import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from '@cgomanager/shared-data-access';
import { ProfileModalComponent } from '../profile-modal/profile-modal';
import { SettingsModalComponent } from '../settings-modal/settings-modal';
import { LogoutModalComponent } from '../logout-modal/logout-modal';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'cgo-topbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ProfileModalComponent, 
    SettingsModalComponent, 
    LogoutModalComponent
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  breadcrumbs$: Observable<Breadcrumb[]> = new Observable();
  user = signal<any>(null);
  showDropdown = signal(false);

  // Modal flags
  showProfile = signal(false);
  showSettings = signal(false);
  showLogout = signal(false);

  ngOnInit(): void {
    this.breadcrumbs$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.buildBreadcrumbs(this.activatedRoute.root))
    );

    this.api.checkAuth().subscribe(resp => {
      if (resp.authenticated) {
        this.user.set(resp.user);
      }
    });
  }

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  initials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private buildBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'] || routeURL;
      if (label && label !== '') {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
