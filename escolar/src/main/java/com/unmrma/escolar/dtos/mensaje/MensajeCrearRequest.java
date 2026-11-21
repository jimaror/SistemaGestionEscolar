package com.unmrma.escolar.dtos.mensaje;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para crear un mensaje. Solo el director o un participante
 * de la conversacion puede escribir en ella. El remitente se fuerza desde
 * la cuenta autenticada en el controlador, no se acepta del cliente.
 */
public class MensajeCrearRequest {

    @NotNull(message = "La conversacion es obligatoria")
    private Integer conversacionId;

    @NotNull(message = "El destinatario es obligatorio")
    private Integer destinatarioUsuarioId;

    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 10000, message = "El contenido no puede exceder 10000 caracteres")
    private String contenido;

    public Integer getConversacionId() { return conversacionId; }
    public void setConversacionId(Integer conversacionId) { this.conversacionId = conversacionId; }

    public Integer getDestinatarioUsuarioId() { return destinatarioUsuarioId; }
    public void setDestinatarioUsuarioId(Integer destinatarioUsuarioId) { this.destinatarioUsuarioId = destinatarioUsuarioId; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
}
