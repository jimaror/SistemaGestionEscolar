package com.unmrma.escolar.dtos.conversacionparticipante;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para agregar un participante a una conversacion.
 * Solo el creador de la conversacion o el director pueden agregarlos.
 */
public class ConversacionParticipanteCrearRequest {

    @NotNull(message = "La conversacion es obligatoria")
    private Integer conversacionId;

    @NotNull(message = "El usuario es obligatorio")
    private Integer usuarioId;

    @Size(max = 20, message = "El rol no puede exceder 20 caracteres")
    private String rolEnConversacion;

    public Integer getConversacionId() { return conversacionId; }
    public void setConversacionId(Integer conversacionId) { this.conversacionId = conversacionId; }

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }

    public String getRolEnConversacion() { return rolEnConversacion; }
    public void setRolEnConversacion(String rolEnConversacion) { this.rolEnConversacion = rolEnConversacion; }
}
