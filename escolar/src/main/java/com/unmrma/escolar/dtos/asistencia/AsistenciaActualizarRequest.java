package com.unmrma.escolar.dtos.asistencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para actualizar una asistencia. Todos los campos son
 * opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados.
 */
public class AsistenciaActualizarRequest {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 20, message = "El estado no puede exceder 20 caracteres")
    private String estado;

    @Size(max = 255, message = "La observación no puede exceder 255 caracteres")
    private String observacion;

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
