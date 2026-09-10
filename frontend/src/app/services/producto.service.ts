import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/productos';

  listar(): Observable<Producto[]> { return this.http.get<Producto[]>(this.apiUrl); }
  crear(producto: Producto): Observable<Producto> { return this.http.post<Producto>(this.apiUrl, producto); }
  actualizar(id: number, producto: Producto): Observable<Producto> { return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
