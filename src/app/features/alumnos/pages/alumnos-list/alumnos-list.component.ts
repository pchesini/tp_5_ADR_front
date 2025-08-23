import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlumnosService, Alumno, Page } from '../../services/alumnos.service';

/* Material */
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alumnos-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './alumnos-list.component.html',
  styleUrl: './alumnos-list.component.scss'
})
export class AlumnosListComponent implements OnInit {

  /* Estado UI */
  loading = false;
  search = '';

  /* Paginación/ordenamiento (servidor) */
  page = 0;
  size = 10;
  sort = 'apellido,asc';

  /* Datos */
  data?: Page<Alumno>;
  displayedColumns = ['apellido', 'nombre', 'email', 'fechaNacimiento', 'acciones'];

  constructor(private svc: AlumnosService, private sb: MatSnackBar) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list({ search: this.search, page: this.page, size: this.size, sort: this.sort })
      .subscribe({
        next: d => { this.data = d; this.loading = false; },
        error: err => {
          this.loading = false;
          console.error(err);
          this.sb.open('Error cargando alumnos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  buscar(): void {
    this.page = 0;
    this.load();
  }

  onPage(ev: PageEvent): void {
    this.page = ev.pageIndex;
    this.size = ev.pageSize;
    this.load();
  }

  onSort(ev: Sort): void {
    if (!ev.active || !ev.direction) {
      this.sort = 'apellido,asc';
    } else {
      this.sort = `${ev.active},${ev.direction}`;
    }
    this.page = 0;
    this.load();
  }

  confirmRemove(a: Alumno): void {
    if (!a.id) return;
    const ok = confirm(`¿Eliminar a ${a.apellido}, ${a.nombre}?`);
    if (!ok) return;

    this.svc.remove(a.id).subscribe({
      next: () => {
        this.sb.open('Alumno eliminado', 'OK', { duration: 2500 });
        this.load();
      },
      error: err => {
        console.error(err);
        this.sb.open('No se pudo eliminar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
