import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { InventarioPageComponent } from './pages/inventario-page.component';
import { CrearPedidoPageComponent } from './pages/crear-pedido-page.component';
import { PedidosPageComponent } from './pages/pedidos-page.component';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'inventario', component: InventarioPageComponent },
  { path: 'pedidos/nuevo', component: CrearPedidoPageComponent },
  { path: 'pedidos', component: PedidosPageComponent },
  { path: '**', redirectTo: '' }
];
