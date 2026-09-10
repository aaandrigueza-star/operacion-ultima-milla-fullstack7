export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type Estado = 'PENDIENTE' | 'CONFIRMADO' | 'DESPACHADO' | 'CANCELADO';

export interface Pedido {
  id?: number;
  cliente: string;
  productoId: number;
  cantidad: number;
  prioridad: Prioridad;
  estado?: Estado;
}
