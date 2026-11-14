package com.unmrma.escolar.dtos.conversacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para crear una conversacion. El campo creadaPor se
 * fuerza desde el usuario autenticado en el controlador, no se acepta del
 * cliente para evitar suplantacion.
 */
public class ConversacionCrearRequest {

    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String titulo;

    @NotBlank(message = "El tipo de conversacion es obligatorio")
    @Size(max = 20, message = "El tipo no puede exceder 20 caracteres")
    private String tipo;

    private Boolean estado = true;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}
