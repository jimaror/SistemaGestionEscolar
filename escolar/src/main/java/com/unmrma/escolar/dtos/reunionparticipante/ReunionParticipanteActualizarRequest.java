package com.unmrma.escolar.dtos.reunionparticipante;

import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar un participante de reunion.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 * No se puede cambiar reunionId ni usuarioId.
 */
public class ReunionParticipanteActualizarRequest {

    private Boolean confirmado;

    private Boolean asistio;

    @Size(max = 255, message = "La observación no puede exceder 255 caracteres")
    private String observacion;

    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }

    public Boolean getAsistio() { return asistio; }
    public void setAsistio(Boolean asistio) { this.asistio = asistio; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
