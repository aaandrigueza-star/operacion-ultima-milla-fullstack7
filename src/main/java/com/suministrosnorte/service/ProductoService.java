package com.suministrosnorte.service;

import com.suministrosnorte.model.Producto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final List<Producto> productos = new ArrayList<>();
    private Long nextId = 6L;

    public ProductoService() {
        productos.add(new Producto(1L, "Nike Air Max", 250000.0, 20, "Calzado"));
        productos.add(new Producto(2L, "Adidas Ultraboost", 320000.0, 5, "Calzado"));
        productos.add(new Producto(3L, "Puma Suede", 180000.0, 0, "Calzado"));
        productos.add(new Producto(4L, "Converse Chuck Taylor", 150000.0, 12, "Calzado"));
        productos.add(new Producto(5L, "New Balance 574", 280000.0, 8, "Calzado"));
    }

    public synchronized List<Producto> listar() {
        return new ArrayList<>(productos);
    }

    public synchronized Optional<Producto> buscarPorId(Long id) {
        return productos.stream().filter(p -> p.getId().equals(id)).findFirst();
    }

    public synchronized Producto crear(Producto producto) {
        validar(producto);
        producto.setId(nextId++);
        productos.add(producto);
        return producto;
    }

    public synchronized Optional<Producto> actualizar(Long id, Producto productoActualizado) {
        validar(productoActualizado);
        return buscarPorId(id).map(producto -> {
            producto.setNombre(productoActualizado.getNombre());
            producto.setPrecio(productoActualizado.getPrecio());
            producto.setCantidad(productoActualizado.getCantidad());
            producto.setCategoria(productoActualizado.getCategoria());
            return producto;
        });
    }

    public synchronized boolean eliminar(Long id) {
        return productos.removeIf(p -> p.getId().equals(id));
    }

    public synchronized boolean descontarStock(Long productoId, Integer cantidad) {
        Optional<Producto> productoOpt = buscarPorId(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            if (producto.getCantidad() >= cantidad) {
                producto.setCantidad(producto.getCantidad() - cantidad);
                return true;
            }
        }
        return false;
    }

    public synchronized void devolverStock(Long productoId, Integer cantidad) {
        buscarPorId(productoId).ifPresent(producto ->
                producto.setCantidad(producto.getCantidad() + cantidad)
        );
    }

    private void validar(Producto producto) {
        if (producto == null || producto.getNombre() == null || producto.getNombre().isBlank()
                || producto.getPrecio() == null || producto.getPrecio() < 0
                || producto.getCantidad() == null || producto.getCantidad() < 0
                || producto.getCategoria() == null || producto.getCategoria().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "nombre, precio, cantidad y categoria son obligatorios; precio y cantidad no pueden ser negativos");
        }
    }
}
