package com.suministrosnorte.model;

public enum Prioridad {
    BAJA(1),
    MEDIA(2),
    ALTA(3),
    URGENTE(4);

    private final int peso;

    Prioridad(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }
}