import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/pedidos';

  listar(): Observable<Pedido[]> { return this.http.get<Pedido[]>(this.apiUrl); }
  crear(pedido: Pedido): Observable<Pedido> { return this.http.post<Pedido>(this.apiUrl, pedido); }
  confirmar(id: number): Observable<Pedido> { return this.http.put<Pedido>(`${this.apiUrl}/${id}/confirmar`, {}); }
  cancelar(id: number): Observable<Pedido> { return this.http.put<Pedido>(`${this.apiUrl}/${id}/cancelar`, {}); }
  despachar(id: number): Observable<Pedido> { return this.http.put<Pedido>(`${this.apiUrl}/${id}/despachar`, {}); }
}
