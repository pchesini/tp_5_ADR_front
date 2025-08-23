import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  NativeDateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AlumnosService, Alumno } from '../../services/alumnos.service';

/* =========================
   Adaptador y formatos ES
   ========================= */

// Adaptador que PARSEA y MUESTRA como dd/MM/yyyy
export class EsDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      // admite dd/MM/yyyy
      const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const d = Number(match[1]);
        const m = Number(match[2]) - 1; // 0-based
        const y = Number(match[3]);
        const date = new Date(y, m, d);
        return isNaN(date.getTime()) ? null : date;
      }
    }
    const ts = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(ts) ? null : new Date(ts);
  }

  override format(date: Date, displayFormat: unknown): string {
    const day = this._to2(date.getDate());
    const month = this._to2(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // dd/MM/yyyy
  }

  private _to2(n: number) { return ('00' + n).slice(-2); }
}

// Formatos para Material (coinciden con el adaptador)
export const ES_DATE_FORMATS = {
  parse:   { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-alumnos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    { provide: DateAdapter, useClass: EsDateAdapter },        // 👈 usamos el adaptador ES
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS }  // 👈 y estos formatos
  ],
  templateUrl: './alumnos-form.component.html',
  styleUrls: ['./alumnos-form.component.scss']
})
export class AlumnosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(AlumnosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  id?: number;
  form!: FormGroup;
  loading = false;
  today = new Date();

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.loading = true;
      this.svc.get(this.id).subscribe({
        next: a => {
          this.form.patchValue({
            nombre: a.nombre,
            apellido: a.apellido,
            email: a.email,
            // Puede venir como 'yyyy-MM-dd' (ISO) o Date; el adaptador lo muestra como dd/MM/yyyy
            fechaNacimiento: a.fechaNacimiento,
            telefono: a.telefono ?? '',
            direccion: a.direccion ?? ''
          });
          this.loading = false;
        },
        error: _ => {
          this.loading = false;
          this.snack.open('No se pudo cargar el alumno', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/alumnos']);
        }
      });
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80), this.noSoloEspacios]],
      apellido: ['', [Validators.required, Validators.maxLength(80), this.noSoloEspacios]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      fechaNacimiento: ['', [Validators.required, this.edadMinima(5)]],
      telefono: ['', [Validators.maxLength(30)]],
      direccion: ['', [Validators.maxLength(200)]],
    });
  }

  // Validadores personalizados
  noSoloEspacios(ctrl: AbstractControl): ValidationErrors | null {
    const v = (ctrl.value ?? '').toString();
    return v.trim().length ? null : { soloEspacios: true };
  }

  edadMinima(min: number) {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const value = ctrl.value;
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return { fechaInvalida: true };
      const edad = this.calcularEdad(d);
      return edad >= min ? null : { edadMinima: { requerida: min, actual: edad } };
    };
  }

  private calcularEdad(nac: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  // Helpers
  get f() { return this.form.controls; }
  hasError(name: string, error: string) { return this.f[name].touched && this.f[name].hasError(error); }

  // Guardar
  save(stayHere: boolean): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Revisá los campos marcados', 'Cerrar', { duration: 2500 });
      return;
    }

    const raw = this.form.getRawValue();
    // raw.fechaNacimiento es Date (gracias al adaptador/datepicker)
    const fecha = raw.fechaNacimiento instanceof Date ? raw.fechaNacimiento : new Date(raw.fechaNacimiento);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');

    const payload: Alumno = {
      nombre: raw.nombre.trim(),
      apellido: raw.apellido.trim(),
      email: raw.email.trim().toLowerCase(),
      fechaNacimiento: `${yyyy}-${mm}-${dd}`, // ISO para LocalDate en backend
      telefono: raw.telefono?.trim() || undefined,
      direccion: raw.direccion?.trim() || undefined
    };

    this.loading = true;
    const req$ = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);

    req$.subscribe({
      next: _ => {
        this.loading = false;
        this.form.markAsPristine();

        const action = stayHere ? 'Seguir aquí' : 'Ir a lista';
        const ref = this.snack.open(this.id ? 'Alumno actualizado' : 'Alumno creado', action, { duration: 3000 });

        if (stayHere) {
          ref.onAction().subscribe(() => {}); // quedarse
        } else {
          ref.onAction().subscribe(() => this.router.navigate(['/alumnos']));
          ref.afterDismissed().subscribe(() => this.router.navigate(['/alumnos']));
        }
      },
      error: _ => {
        this.loading = false;
        this.snack.open('Error al guardar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/alumnos']);
  }
}
