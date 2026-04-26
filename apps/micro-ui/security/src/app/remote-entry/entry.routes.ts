import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { UserDirectoryComponent } from '../features/user-directory/user-directory.component';
import { RolesComponent } from '../features/roles/roles.component';
import { RoleCreateComponent } from '../features/roles/role-create.component';
import { UserEditComponent } from '../features/user-edit/user-edit.component';
import { ProductsComponent } from '../features/products/products';
import { ModulesComponent } from '../features/modules/modules';
import { FeaturesComponent } from '../features/features/features';
import { ActionsComponent } from '../features/actions/actions';
import { LanguagesComponent } from '../features/languages/languages';

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
      // Iteration 2
      { path: 'products', component: ProductsComponent },
      { path: 'modules', component: ModulesComponent },
      { path: 'features', component: FeaturesComponent },
      { path: 'actions', component: ActionsComponent },
      { path: 'languages', component: LanguagesComponent },
      { path: '', redirectTo: 'user-directory', pathMatch: 'full' }
    ]
  }
];
