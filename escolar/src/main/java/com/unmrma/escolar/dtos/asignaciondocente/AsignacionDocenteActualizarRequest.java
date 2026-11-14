package com.unmrma.escolar.dtos.asignaciondocente;

import jakarta.validation.constraints.Positive;

/**
 * DTO de solicitud para actualizar una asignacion docente. Todos los campos
 * son opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados.
 */
public class AsignacionDocenteActualizarRequest {

    @Positive(message = "Las horas semanales deben ser positivas")
    private Byte horasSemanales;

    private Boolean estado;

    public Byte getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Byte horasSemanales) { this.horasSemanales = horasSemanales; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}
