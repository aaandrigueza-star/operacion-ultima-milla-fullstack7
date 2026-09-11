package com.suministrosnorte.service;

import com.suministrosnorte.model.Estado;
import com.suministrosnorte.model.Pedido;
import com.suministrosnorte.model.Prioridad;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PedidoService {

    private final List<Pedido> pedidos = new ArrayList<>();
    private final ProductoService productoService;

    public PedidoService(ProductoService productoService) {
        this.productoService = productoService;
    }

    public synchronized Pedido crearPedido(Pedido pedido) {
        if (pedido == null || pedido.getCliente() == null || pedido.getCliente().isBlank()
                || pedido.getProductoId() == null || pedido.getCantidad() == null
                || pedido.getCantidad() <= 0 || pedido.getPrioridad() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "cliente, productoId, cantidad y prioridad son obligatorios; cantidad debe ser mayor que cero");
        }
        productoService.buscarPorId(pedido.getProductoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no existe"));

        pedido.setId((long) (pedidos.size() + 1));
        pedido.setEstado(Estado.PENDIENTE);
        pedidos.add(pedido);
        return pedido;
    }

    public synchronized List<Pedido> obtenerPedidos() {
        return new ArrayList<>(pedidos);
    }

    public synchronized Pedido confirmar(Long id) {
        Pedido pedido = buscar(id);
        exigirEstado(pedido, Estado.PENDIENTE);

        boolean ok = productoService.descontarStock(pedido.getProductoId(), pedido.getCantidad());
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente");
        }
        pedido.setEstado(Estado.CONFIRMADO);
        return pedido;
    }

    public synchronized Pedido cancelar(Long id) {
        Pedido pedido = buscar(id);
        if (pedido.getEstado() == Estado.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido ya está cancelado");
        }
        if (pedido.getEstado() == Estado.DESPACHADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede cancelar un pedido despachado");
        }
        if (pedido.getEstado() == Estado.CONFIRMADO) {
            productoService.devolverStock(pedido.getProductoId(), pedido.getCantidad());
        }
        pedido.setEstado(Estado.CANCELADO);
        return pedido;
    }

    public synchronized Pedido despachar(Long id) {
        Pedido pedido = buscar(id);
        exigirEstado(pedido, Estado.CONFIRMADO);
        pedido.setEstado(Estado.DESPACHADO);
        return pedido;
    }

    public synchronized List<Pedido> porEstado(Estado estado) {
        return pedidos.stream().filter(p -> p.getEstado() == estado).toList();
    }

    public synchronized List<Pedido> urgentes() {
        return pedidos.stream().filter(p -> p.getPrioridad() == Prioridad.URGENTE).toList();
    }

    public synchronized Pedido siguiente() {
        return pedidos.stream()
                .filter(p -> p.getEstado() == Estado.PENDIENTE)
                .min(Comparator.comparing(Pedido::getPrioridad, Comparator.comparingInt(Prioridad::getPeso).reversed())
                        .thenComparing(Pedido::getId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay pedidos pendientes"));
    }

    public synchronized List<Pedido> enRiesgo() {
        return pedidos.stream()
                .filter(p -> p.getEstado() == Estado.PENDIENTE
                        && productoService.buscarPorId(p.getProductoId())
                                .map(prod -> prod.getCantidad() < p.getCantidad())
                                .orElse(false))
                .toList();
    }

    public synchronized Map<String, Long> resumen() {
        Map<String, Long> resumen = new HashMap<>();
        for (Estado estado : Estado.values()) {
            resumen.put(estado.name().toLowerCase(), pedidos.stream()
                    .filter(p -> p.getEstado() == estado).count());
        }
        resumen.put("total", (long) pedidos.size());
        resumen.put("urgentes", pedidos.stream()
                .filter(p -> p.getPrioridad() == Prioridad.URGENTE).count());
        return resumen;
    }

    private Pedido buscar(Long id) {
        return pedidos.stream().filter(p -> p.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado. Vuelve a intentarlo."));
    }

    private void exigirEstado(Pedido pedido, Estado esperado) {
        if (pedido.getEstado() != esperado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El pedido debe estar " + esperado + " para realizar esta operación");
        }
    }
}
