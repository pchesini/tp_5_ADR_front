import { Component, OnInit } from '@angular/core';
import { AlumnosService, Alumno, Page } from '../../services/alumnos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alumnos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './alumnos-list.component.html',
  styleUrl: './alumnos-list.component.scss'
})

export class AlumnosListComponent implements OnInit {
  search = '';
  page = 0;
  size = 10;
  sort = 'apellido,asc';
  data?: Page<Alumno>;
  loading = false;

  constructor(private svc: AlumnosService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.list({ search: this.search, page: this.page, size: this.size, sort: this.sort })
      .subscribe({ next: d => { this.data = d; this.loading = false; }, error: _ => this.loading = false });
  }
  buscar() { this.page = 0; this.load(); }
  next() { if (this.data && this.page < this.data.totalPages - 1) { this.page++; this.load(); } }
  prev() { if (this.page > 0) { this.page--; this.load(); } 
}
remove(a: Alumno) {
  if (!a.id) return;                 
  this.svc.remove(a.id).subscribe({
    next: () => this.load(),         
    error: err => console.error(err) 
  });
}
}

