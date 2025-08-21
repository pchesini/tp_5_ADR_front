import { Component, OnInit } from '@angular/core';
import { AlumnosService, Alumno } from '../../services/alumnos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-alumnos-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './alumnos-form.component.html'
})
export class AlumnosFormComponent implements OnInit {
  id?: number;
  model: Alumno = { nombre:'', apellido:'', email:'', fechaNacimiento:'' };

  constructor(private svc: AlumnosService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = +id;
      this.svc.get(this.id).subscribe(a => this.model = a);
    }
  }

  save() {
    const req = this.id ? this.svc.update(this.id, this.model) : this.svc.create(this.model);
    req.subscribe({ next: _ => this.router.navigate(['/alumnos']) });
  }
}

