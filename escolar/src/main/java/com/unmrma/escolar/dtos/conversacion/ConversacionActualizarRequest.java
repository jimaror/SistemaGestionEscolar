package com.unmrma.escolar.dtos.conversacion;

import jakarta.validation.constraints.Size;

/**
 * DTO de solicitud para actualizar una conversacion. Todos los campos son
 * opcionales para permitir actualizaciones parciales, evitando mass
 * assignment de campos no enviados.
 */
public class ConversacionActualizarRequest {

    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    private String titulo;

    @Size(max = 20, message = "El tipo no puede exceder 20 caracteres")
    private String tipo;

    private Boolean estado;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}
