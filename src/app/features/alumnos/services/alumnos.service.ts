import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface Alumno {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // YYYY-MM-DD
  telefono?: string;
  direccion?: string;
}
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private base = `${environment.apiUrl}/alumnos`;
  constructor(private http: HttpClient) {}

  list(params: { search?: string; page?: number; size?: number; sort?: string }): Observable<Page<Alumno>> {
    let p = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 10))
      .set('sort', params.sort ?? 'apellido,asc');
    if (params.search) p = p.set('search', params.search);
    return this.http.get<Page<Alumno>>(this.base, { params: p });
  }

  get(id: number)      { return this.http.get<Alumno>(`${this.base}/${id}`); }
  create(body: Alumno) { return this.http.post<Alumno>(this.base, body); }
  update(id: number, body: Alumno) { return this.http.put<Alumno>(`${this.base}/${id}`, body); }
  remove(id: number)   { return this.http.delete(`${this.base}/${id}`); }
}



