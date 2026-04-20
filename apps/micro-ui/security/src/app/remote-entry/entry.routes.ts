import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { UserDirectoryComponent } from '../features/user-directory/user-directory.component';
import { RolesComponent } from '../features/roles/roles.component';
import { UserEditComponent } from '../features/user-edit/user-edit.component';
import { RoleCreateComponent } from '../features/roles/role-create.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      { path: 'user-directory', component: UserDirectoryComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'roles/create', component: RoleCreateComponent },
      { path: 'user-edit', component: UserEditComponent },
      { path: 'user-edit/:id', component: UserEditComponent },
      { path: '', redirectTo: 'user-directory', pathMatch: 'full' }
    ]
  }
];
