package com.unmrma.escolar.dtos.conversacionparticipante;

import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar un participante de conversacion.
 * Todos los campos son opcionales para permitir actualizaciones parciales,
 * evitando mass assignment de campos no enviados.
 */
public class ConversacionParticipanteActualizarRequest {

    @Size(max = 20, message = "El rol no puede exceder 20 caracteres")
    private String rolEnConversacion;

    private Boolean activo;

    public String getRolEnConversacion() { return rolEnConversacion; }
    public void setRolEnConversacion(String rolEnConversacion) { this.rolEnConversacion = rolEnConversacion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
