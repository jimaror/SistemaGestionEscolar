package com.unmrma.escolar.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "grados")
public class Grado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grado")
    private Byte id;

    @NotBlank(message = "El nombre del grado es obligatorio")
    private String nombre; // Ej: "1er Año", "2do Año"

    private String nivel;  // Ej: "Primaria", "Secundaria"

    @NotNull(message = "El orden del grado es obligatorio")
    @Column(name = "orden", nullable = false)
    private Byte orden;

    // Getters y Setters
    public Byte getId() { return id; }
    public void setId(Byte id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Byte getOrden() { return orden; }
    public void setOrden(Byte orden) { this.orden = orden; }
}