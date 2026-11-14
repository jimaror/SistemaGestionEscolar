package com.unmrma.escolar.dtos.reunion;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una reunion. Expone solo los campos planos y el ID
 * de la asignacion docente relacionada, sin exponer el objeto completo.
 */
public class ReunionRespuesta {

    private Integer id;
    private Integer asignacionDocenteId;
    private String titulo;
    private String descripcion;
    private String enlace;
    private LocalDateTime fechaHora;
    private Integer duracionMinutos;
    private String estado;
    private Integer creadaPorId;
    private LocalDateTime fechaCreacion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAsignacionDocenteId() { return asignacionDocenteId; }
    public void setAsignacionDocenteId(Integer asignacionDocenteId) { this.asignacionDocenteId = asignacionDocenteId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEnlace() { return enlace; }
    public void setEnlace(String enlace) { this.enlace = enlace; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getCreadaPorId() { return creadaPorId; }
    public void setCreadaPorId(Integer creadaPorId) { this.creadaPorId = creadaPorId; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
