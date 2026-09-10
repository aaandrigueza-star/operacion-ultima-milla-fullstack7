package com.suministrosnorte.controller;

import com.suministrosnorte.model.Estado;
import com.suministrosnorte.model.Pedido;
import com.suministrosnorte.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // POST /pedidos
    @PostMapping
    public ResponseEntity<Pedido> crear(@RequestBody Pedido pedido) {
        Pedido creado = pedidoService.crearPedido(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // GET /pedidos (extra, útil para ver todos)
    @GetMapping
    public ResponseEntity<List<Pedido>> listar() {
        return ResponseEntity.ok(pedidoService.obtenerPedidos());
    }

    // PUT /pedidos/{id}/confirmar
    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Pedido> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.confirmar(id));
    }

    // PUT /pedidos/{id}/cancelar
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.cancelar(id));
    }

    // PUT /pedidos/{id}/despachar
    @PutMapping("/{id}/despachar")
    public ResponseEntity<Pedido> despachar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.despachar(id));
    }

    // GET /pedidos/pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<Pedido>> pendientes() {
        return ResponseEntity.ok(pedidoService.porEstado(Estado.PENDIENTE));
    }

    // GET /pedidos/urgentes
    @GetMapping("/urgentes")
    public ResponseEntity<List<Pedido>> urgentes() {
        return ResponseEntity.ok(pedidoService.urgentes());
    }

    // GET /pedidos/estado?estado=CONFIRMADO
    @GetMapping("/estado")
    public ResponseEntity<List<Pedido>> porEstado(@RequestParam Estado estado) {
        return ResponseEntity.ok(pedidoService.porEstado(estado));
    }

    // GET /pedidos/resumen
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Long>> resumen() {
        return ResponseEntity.ok(pedidoService.resumen());
    }

    // GET /pedidos/siguiente
    @GetMapping("/siguiente")
    public ResponseEntity<Pedido> siguiente() {
        return ResponseEntity.ok(pedidoService.siguiente());
    }

    // GET /pedidos/en-riesgo
    @GetMapping("/en-riesgo")
    public ResponseEntity<List<Pedido>> enRiesgo() {
        return ResponseEntity.ok(pedidoService.enRiesgo());
    }
}