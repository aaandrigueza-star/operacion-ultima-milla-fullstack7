import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../models/pedido';
import { Producto } from '../models/producto';
import { PedidoService } from '../services/pedido.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-crear-pedido-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel form-panel">
      <p class="eyebrow">CREAR PEDIDO</p>
      <h2>Registrar pedido</h2>

      @if (mensaje) {
        <p class="message" [class.error]="esError" role="status">{{ mensaje }}</p>
      }

      <form (ngSubmit)="crearPedido()">
        <label>Cliente
          <input name="cliente" [(ngModel)]="pedidoForm.cliente" required>
        </label>

        <label>Zapato
          <select name="productoId" [(ngModel)]="pedidoForm.productoId" required>
            <option [ngValue]="0" disabled>Selecciona un zapato</option>
            @for (producto of productos; track producto.id) {
              <option [ngValue]="producto.id">{{ producto.nombre }} · {{ producto.categoria }} · {{ producto.cantidad }} disponibles</option>
            }
          </select>
        </label>

        <label>Cantidad
          <input name="pedidoCantidad" type="number" min="1" [(ngModel)]="pedidoForm.cantidad" required>
        </label>

        <label>Prioridad
          <select name="prioridad" [(ngModel)]="pedidoForm.prioridad">
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </label>

        <button class="primary" type="submit">Crear pedido</button>
      </form>
    </section>
  `
})
export class CrearPedidoPageComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  productos: Producto[] = [];
  pedidoForm: Pedido = { cliente: '', productoId: 0, cantidad: 1, prioridad: 'MEDIA' };
  mensaje = '';
  esError = false;

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: productos => this.productos = productos,
      error: error => this.mostrarError(error)
    });
  }

  crearPedido(): void {
    this.pedidoService.crear({
      ...this.pedidoForm,
      productoId: Number(this.pedidoForm.productoId),
      cantidad: Number(this.pedidoForm.cantidad)
    }).subscribe({
      next: () => {
        this.mostrarMensaje('Pedido creado correctamente.');
        this.pedidoForm = { cliente: '', productoId: 0, cantidad: 1, prioridad: 'MEDIA' };
      },
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
