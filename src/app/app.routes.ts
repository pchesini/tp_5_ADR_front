import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell.component';
import { AlumnosListComponent } from './features/alumnos/pages/alumnos-list/alumnos-list.component';
import { AlumnosFormComponent } from './features/alumnos/pages/alumnos-form/alumnos-form.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { HomeComponent } from './features/home/pages/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'home', component: HomeComponent },  
      { path: 'alumnos', component: AlumnosListComponent },
      { path: 'alumnos/new', component: AlumnosFormComponent },
      { path: 'alumnos/:id/edit', component: AlumnosFormComponent },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  }
];
