package com.unmrma.escolar.dtos.grado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para crear un grado. Solo el director puede crearlos.
 */
public class GradoCrearRequest {

    @NotBlank(message = "El nombre del grado es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    private String nombre;

    @Size(max = 50, message = "El nivel no puede exceder 50 caracteres")
    private String nivel;

    @NotNull(message = "El orden del grado es obligatorio")
    private Byte orden;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }

    public Byte getOrden() { return orden; }
    public void setOrden(Byte orden) { this.orden = orden; }
}
