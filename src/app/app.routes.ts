import { Routes } from '@angular/router';

import { AlumnosListComponent } from './features/alumnos/pages/alumnos-list/alumnos-list.component';
import { AlumnosFormComponent } from './features/alumnos/pages/alumnos-form/alumnos-form.component';

// Layout + Login
//import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
   { path: 'alumnos', component: AlumnosListComponent },
  { path: 'alumnos/new', component: AlumnosFormComponent },
  { path: 'alumnos/:id/edit', component: AlumnosFormComponent },
  { path: '', pathMatch: 'full', redirectTo: 'alumnos' }

];
