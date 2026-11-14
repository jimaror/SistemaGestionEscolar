package com.unmrma.escolar.dtos.conversacion;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una conversacion. Expone solo los campos planos y
 * el ID del creador, sin exponer el objeto Usuario completo.
 */
public class ConversacionRespuesta {

    private Integer id;
    private String titulo;
    private String tipo;
    private Integer creadaPorId;
    private LocalDateTime fechaCreacion;
    private Boolean estado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getCreadaPorId() { return creadaPorId; }
    public void setCreadaPorId(Integer creadaPorId) { this.creadaPorId = creadaPorId; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}
