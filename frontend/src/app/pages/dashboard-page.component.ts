import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Producto } from '../models/producto';
import { Pedido } from '../models/pedido';
import { ProductoService } from '../services/producto.service';
import { PedidoService } from '../services/pedido.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="intro">
      <div>
        <p class="eyebrow">INTEGRACION FULL STACK</p>
        <h1>Inventario y pedidos</h1>
      </div>
      <p>Gestiona productos, disponibilidad y el ciclo operativo de cada pedido.</p>
    </section>

    <section class="metrics" aria-label="Resumen operativo">
      <article><strong>{{ resumen.productos }}</strong><span>Productos</span></article>
      <article><strong>{{ resumen.stockBajo }}</strong><span>Stock bajo</span></article>
      <article><strong>{{ resumen.pedidos }}</strong><span>Pedidos</span></article>
      <article><strong>{{ resumen.pendientes }}</strong><span>Pendientes</span></article>
      <article><strong>{{ resumen.urgentes }}</strong><span>Urgentes</span></article>
      <article><strong>{{ resumen.confirmados }}</strong><span>Confirmados</span></article>
      <article><strong>{{ resumen.cancelados }}</strong><span>Cancelados</span></article>
    </section>

    <section class="search-box panel" aria-label="Buscar productos o pedidos">
      <label for="busquedaInicio">Buscar</label>
      <input
        id="busquedaInicio"
        type="text"
        [value]="terminoBusqueda"
        (input)="terminoBusqueda = $any($event.target).value"
        placeholder="Busca por nombre del zapato, cliente, apellido o precio"
      />
    </section>

    <section class="summary-grid" aria-label="Resumen de zapatos y seguimiento">
      <article class="panel summary-panel">
        <div class="panel-header">
          <h2>Zapatos disponibles</h2>
          <span class="badge">{{ productosFiltrados.length }}</span>
        </div>

        <div class="summary-list">
          <div class="summary-item" *ngFor="let producto of productosFiltrados.slice(0, 5)">
            <div>
              <strong>{{ producto.nombre }}</strong>
              <span>{{ producto.categoria }} • {{ producto.precio | currency:'MXN':'symbol':'1.0-0' }}</span>
            </div>
            <span class="stock-chip" [class.disponible]="producto.cantidad > 5" [class.bajo]="producto.cantidad > 0 && producto.cantidad <= 5" [class.critico]="producto.cantidad === 0">
              {{ producto.cantidad }} uds
            </span>
          </div>

          <div class="empty" *ngIf="!productosFiltrados.length">No se encontraron zapatos con ese criterio.</div>
        </div>
      </article>

      <article class="panel summary-panel">
        <div class="panel-header">
          <h2>Seguimiento de pedidos</h2>
          <span class="badge">{{ pedidosFiltrados.length }}</span>
        </div>

        <div class="summary-list">
          <div class="summary-item" *ngFor="let pedido of pedidosFiltrados.slice(0, 5)">
            <div>
              <strong>Pedido #{{ pedido.id ?? 'N/D' }}</strong>
              <span>{{ pedido.cliente }} • {{ pedido.cantidad }} ud</span>
            </div>
            <span class="status"
              [class.pendiente]="pedido.estado === 'PENDIENTE'"
              [class.confirmado]="pedido.estado === 'CONFIRMADO'"
              [class.despachado]="pedido.estado === 'DESPACHADO'"
              [class.cancelado]="pedido.estado === 'CANCELADO'">
              {{ pedido.estado ?? 'PENDIENTE' }}
            </span>
          </div>

          <div class="empty" *ngIf="!pedidosFiltrados.length">No se encontraron pedidos con ese criterio.</div>
        </div>
      </article>
    </section>
  `
})
export class DashboardPageComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  productos: Producto[] = [];
  pedidos: Pedido[] = [];
  terminoBusqueda = '';

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: productos => this.productos = productos,
      error: () => this.productos = []
    });

    this.pedidoService.listar().subscribe({
      next: pedidos => this.pedidos = pedidos,
      error: () => this.pedidos = []
    });
  }

  get productosFiltrados(): Producto[] {
    const texto = this.terminoBusqueda.trim().toLowerCase();
    if (!texto) return this.productos;

    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto) ||
      String(producto.precio).includes(texto)
    );
  }

  get pedidosFiltrados(): Pedido[] {
    const texto = this.terminoBusqueda.trim().toLowerCase();
    if (!texto) return this.pedidos;

    return this.pedidos.filter(pedido =>
      (pedido.cliente ?? '').toLowerCase().includes(texto) ||
      String(pedido.id ?? '').includes(texto) ||
      String(pedido.cantidad).includes(texto) ||
      (pedido.estado ?? '').toLowerCase().includes(texto) ||
      (pedido.prioridad ?? '').toLowerCase().includes(texto)
    );
  }

  get resumen() {
    return {
      productos: this.productos.length,
      stockBajo: this.productos.filter(producto => producto.cantidad > 0 && producto.cantidad <= 5).length,
      pedidos: this.pedidos.length,
      pendientes: this.pedidos.filter(pedido => pedido.estado === 'PENDIENTE').length,
      urgentes: this.pedidos.filter(pedido => pedido.prioridad === 'URGENTE').length,
      confirmados: this.pedidos.filter(pedido => pedido.estado === 'CONFIRMADO').length,
      cancelados: this.pedidos.filter(pedido => pedido.estado === 'CANCELADO').length
    };
  }
}
