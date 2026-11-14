package com.unmrma.escolar.dtos.matricula;

import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar una matricula. Todos los campos son
 * opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados. No incluye alumnoId porque no se puede
 * cambiar el alumno de una matricula existente.
 */
public class MatriculaActualizarRequest {

    @Size(max = 255, message = "Las observaciones no pueden exceder 255 caracteres")
    private String observaciones;

    private String estado;

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
