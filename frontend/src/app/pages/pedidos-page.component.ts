import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Estado, Pedido } from '../models/pedido';
import { Producto } from '../models/producto';
import { PedidoService } from '../services/pedido.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <p class="eyebrow">PEDIDOS REALIZADOS</p>
      <h2>Seguimiento de pedidos</h2>

      @if (mensaje) {
        <p class="message" [class.error]="esError" role="status">{{ mensaje }}</p>
      }

      <div class="order-list">
        @for (pedido of pedidos; track pedido.id) {
          <article class="order-row">
            <div>
              <strong>#{{ pedido.id }} · {{ pedido.cliente }}</strong>
              <span>{{ nombreProducto(pedido.productoId) }} · {{ pedido.cantidad }} unidad(es) · {{ pedido.prioridad }}</span>
            </div>
            <span class="status" [class]="pedido.estado?.toLowerCase()">{{ pedido.estado }}</span>
            <div class="row-actions">
              @for (accion of accionesPara(pedido.estado); track accion) {
                <button type="button" (click)="cambiarEstado(pedido, accion)">{{ etiquetaAccion(accion) }}</button>
              }
            </div>
          </article>
        } @empty {
          <p class="empty">No hay pedidos realizados.</p>
        }
      </div>
    </section>
  `
})
export class PedidosPageComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  productos: Producto[] = [];
  pedidos: Pedido[] = [];
  mensaje = '';
  esError = false;

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarPedidos();
  }

  cambiarEstado(pedido: Pedido, accion: 'confirmar' | 'cancelar' | 'despachar'): void {
    if (pedido.id === undefined) return;

    const solicitud = accion === 'confirmar' ? this.pedidoService.confirmar(pedido.id)
      : accion === 'cancelar' ? this.pedidoService.cancelar(pedido.id)
      : this.pedidoService.despachar(pedido.id);

    solicitud.subscribe({
      next: () => {
        this.mostrarMensaje('Pedido actualizado correctamente.');
        this.cargarPedidos();
      },
      error: error => this.mostrarError(error)
    });
  }

  accionesPara(estado?: Estado): Array<'confirmar' | 'cancelar' | 'despachar'> {
    if (estado === 'PENDIENTE') return ['confirmar', 'cancelar'];
    if (estado === 'CONFIRMADO') return ['despachar', 'cancelar'];
    return [];
  }

  etiquetaAccion(accion: 'confirmar' | 'cancelar' | 'despachar'): string {
    return accion.charAt(0).toUpperCase() + accion.slice(1);
  }

  nombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : `Producto ${productoId}`;
  }

  private cargarProductos(): void {
    this.productoService.listar().subscribe({
      next: productos => this.productos = productos,
      error: () => this.productos = []
    });
  }

  private cargarPedidos(): void {
    this.pedidoService.listar().subscribe({
      next: pedidos => this.pedidos = pedidos,
      error: error => this.mostrarError(error)
    });
  }

  private mostrarError(error: unknown): void {
    this.esError = true;

    let apiError: string | undefined;
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      if (typeof payload === 'string') {
        apiError = payload;
      } else if (payload && typeof payload === 'object') {
        apiError = (payload as { mensaje?: string; message?: string; error?: string }).mensaje
          || (payload as { mensaje?: string; message?: string; error?: string }).message
          || (payload as { mensaje?: string; message?: string; error?: string }).error;
      }
    }

    if (!apiError) {
      this.mensaje = 'Algo salió mal. Vuelve a intentarlo.';
      return;
    }

    this.mensaje = apiError.includes('no encontrado') || apiError.includes('No se encontró')
      ? 'Pedido no encontrado. Vuelve a intentarlo.'
      : apiError;
  }

  private mostrarMensaje(mensaje: string): void {
    this.esError = false;
    this.mensaje = mensaje;
  }
}
