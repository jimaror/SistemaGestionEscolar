package com.unmrma.escolar.dtos.reunionparticipante;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para agregar un participante a una reunion.
 * Solo el director o el creador de la reunion pueden agregarlos.
 */
public class ReunionParticipanteCrearRequest {

    @NotNull(message = "La reunion es obligatoria")
    private Integer reunionId;

    @NotNull(message = "El usuario es obligatorio")
    private Integer usuarioId;

    private Boolean confirmado;

    private Boolean asistio;

    @Size(max = 255, message = "La observación no puede exceder 255 caracteres")
    private String observacion;

    public Integer getReunionId() { return reunionId; }
    public void setReunionId(Integer reunionId) { this.reunionId = reunionId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }

    public Boolean getAsistio() { return asistio; }
    public void setAsistio(Boolean asistio) { this.asistio = asistio; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
