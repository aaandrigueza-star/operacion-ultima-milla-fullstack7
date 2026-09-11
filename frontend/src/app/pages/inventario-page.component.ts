import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto } from '../models/producto';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-inventario-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="two-columns order-section">
      <form class="panel form-panel" (ngSubmit)="guardarProducto()">
        <p class="eyebrow">INGRESAR ZAPATOS</p>
        <h2>Agregar calzado al inventario</h2>

        <label>Nombre del zapato
          <input name="nombre" [(ngModel)]="productoForm.nombre" required>
        </label>

        <label>Marca / categoría
          <input name="categoria" [(ngModel)]="productoForm.categoria" required>
        </label>

        <label>Precio
          <input name="precio" type="number" min="0" [(ngModel)]="productoForm.precio" required>
        </label>

        <label>Cantidad
          <input name="cantidad" type="number" min="0" [(ngModel)]="productoForm.cantidad" required>
        </label>

        <div class="form-actions">
          <button class="primary" type="submit">{{ editandoId === undefined ? 'Ingresar zapato' : 'Guardar cambios' }}</button>
          @if (editandoId !== undefined) {
            <button type="button" (click)="cancelarEdicion()">Cancelar</button>
          }
        </div>
      </form>

      <div class="panel">
        <div class="section-title">
          <div>
            <p class="eyebrow">INVENTARIO</p>
            <h2>Zapatos disponibles</h2>
          </div>
        </div>

        <div class="product-list">
          @for (producto of productos; track producto.id) {
            <article class="product-row">
              <div>
                <strong>{{ producto.nombre }}</strong>
                <span>{{ producto.categoria }} · {{ '$' + (producto.precio | number) }}</span>
              </div>
              <span class="stock-chip" [class]="claseStock(producto)">{{ etiquetaStock(producto) }} · {{ producto.cantidad }}</span>
              <div class="row-actions">
                <button type="button" (click)="editarProducto(producto)">Editar</button>
                <button type="button" class="danger" (click)="eliminarProducto(producto)">Eliminar</button>
              </div>
            </article>
          } @empty {
            <p class="empty">No hay zapatos para mostrar.</p>
          }
        </div>
      </div>
    </section>

    @if (mensaje) {
      <p class="message" [class.error]="esError" role="status">{{ mensaje }}</p>
    }
  `
})
export class InventarioPageComponent implements OnInit {
  private readonly productoService = inject(ProductoService);

  productos: Producto[] = [];
  productoForm: Producto = this.productoVacio();
  editandoId?: number;
  mensaje = '';
  esError = false;
  cargando = false;

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando = true;
    this.productoService.listar().subscribe({
      next: productos => {
        this.productos = productos;
        this.cargando = false;
      },
      error: error => this.mostrarError(error)
    });
  }

  guardarProducto(): void {
    const producto = { ...this.productoForm };
    const solicitud = this.editandoId === undefined
      ? this.productoService.crear(producto)
      : this.productoService.actualizar(this.editandoId, producto);

    solicitud.subscribe({
      next: () => {
        this.mostrarMensaje(this.editandoId === undefined ? 'Producto creado correctamente.' : 'Producto actualizado correctamente.');
        this.cancelarEdicion();
        this.recargar();
      },
      error: error => this.mostrarError(error)
    });
  }

  editarProducto(producto: Producto): void {
    this.editandoId = producto.id;
    this.productoForm = { ...producto };
  }

  cancelarEdicion(): void {
    this.editandoId = undefined;
    this.productoForm = this.productoVacio();
  }

  eliminarProducto(producto: Producto): void {
    if (producto.id === undefined || !window.confirm(`¿Eliminar ${producto.nombre}?`)) return;

    this.productoService.eliminar(producto.id).subscribe({
      next: () => {
        this.mostrarMensaje('Producto eliminado correctamente.');
        this.recargar();
      },
      error: error => this.mostrarError(error)
    });
  }

  etiquetaStock(producto: Producto): string {
    if (producto.cantidad === 0) return 'AGOTADO';
    if (producto.cantidad <= 3) return 'CRITICO';
    if (producto.cantidad <= 5) return 'BAJO';
    return 'DISPONIBLE';
  }

  claseStock(producto: Producto): string {
    return this.etiquetaStock(producto).toLowerCase();
  }

  private mostrarError(error: unknown): void {
    this.cargando = false;
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

  private productoVacio(): Producto {
    return { nombre: '', precio: 0, cantidad: 0, categoria: '' };
  }
}
