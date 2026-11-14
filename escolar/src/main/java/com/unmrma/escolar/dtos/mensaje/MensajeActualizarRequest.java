package com.unmrma.escolar.dtos.mensaje;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar un mensaje. Solo el contenido es editable.
 * No se puede cambiar la conversacion ni el remitente.
 */
public class MensajeActualizarRequest {

    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 10000, message = "El contenido no puede exceder 10000 caracteres")
    private String contenido;

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
}
