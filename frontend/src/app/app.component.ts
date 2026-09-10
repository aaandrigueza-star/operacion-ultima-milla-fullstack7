import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Estado, Pedido, Prioridad } from './models/pedido';
import { Producto } from './models/producto';
import { PedidoService } from './services/pedido.service';
import { ProductoService } from './services/producto.service';

type Resumen = Record<'productos' | 'stockBajo' | 'pedidos' | 'pendientes' | 'urgentes' | 'confirmados', number>;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  productos: Producto[] = [];
  pedidos: Pedido[] = [];
  productoForm: Producto = this.productoVacio();
  pedidoForm: Pedido = { cliente: '', productoId: 0, cantidad: 1, prioridad: 'MEDIA' };
  editandoId?: number;
  mensaje = '';
  esError = false;
  cargando = false;

  ngOnInit(): void {
    this.recargar();
  }

  get resumen(): Resumen {
    return {
      productos: this.productos.length,
      stockBajo: this.productos.filter(producto => producto.cantidad > 0 && producto.cantidad <= 5).length,
      pedidos: this.pedidos.length,
      pendientes: this.pedidos.filter(pedido => pedido.estado === 'PENDIENTE').length,
      urgentes: this.pedidos.filter(pedido => pedido.prioridad === 'URGENTE').length,
      confirmados: this.pedidos.filter(pedido => pedido.estado === 'CONFIRMADO').length
    };
  }

  recargar(): void {
    this.cargando = true;
    this.productoService.listar().subscribe({
      next: productos => {
        this.productos = productos;
        this.cargarPedidos();
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

  crearPedido(): void {
    this.pedidoService.crear({ ...this.pedidoForm, productoId: Number(this.pedidoForm.productoId), cantidad: Number(this.pedidoForm.cantidad) }).subscribe({
      next: () => {
        this.mostrarMensaje('Pedido creado correctamente.');
        this.pedidoForm = { cliente: '', productoId: 0, cantidad: 1, prioridad: 'MEDIA' };
        this.recargar();
      },
      error: error => this.mostrarError(error)
    });
  }

  cambiarEstado(pedido: Pedido, accion: 'confirmar' | 'cancelar' | 'despachar'): void {
    if (pedido.id === undefined) return;
    const solicitud = accion === 'confirmar' ? this.pedidoService.confirmar(pedido.id)
      : accion === 'cancelar' ? this.pedidoService.cancelar(pedido.id)
      : this.pedidoService.despachar(pedido.id);
    solicitud.subscribe({
      next: () => {
        this.mostrarMensaje('Pedido actualizado correctamente.');
        this.recargar();
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

  etiquetaStock(producto: Producto): string {
    if (producto.cantidad === 0) return 'AGOTADO';
    if (producto.cantidad <= 3) return 'CRITICO';
    if (producto.cantidad <= 5) return 'BAJO';
    return 'DISPONIBLE';
  }

  claseStock(producto: Producto): string {
    return this.etiquetaStock(producto).toLowerCase();
  }

  private cargarPedidos(): void {
    this.pedidoService.listar().subscribe({
      next: pedidos => {
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: error => this.mostrarError(error)
    });
  }

  private mostrarError(error: unknown): void {
    this.cargando = false;
    this.esError = true;
    const apiError = error instanceof HttpErrorResponse ? error.error?.mensaje || error.error?.message : undefined;
    this.mensaje = apiError || 'No fue posible conectar con el servidor. Verifica que el backend esté disponible.';
  }

  private mostrarMensaje(mensaje: string): void {
    this.esError = false;
    this.mensaje = mensaje;
  }

  private productoVacio(): Producto {
    return { nombre: '', precio: 0, cantidad: 0, categoria: '' };
  }
}
