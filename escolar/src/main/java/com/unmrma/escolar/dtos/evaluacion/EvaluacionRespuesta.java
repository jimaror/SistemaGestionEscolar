package com.unmrma.escolar.dtos.evaluacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para una evaluacion. Expone solo los campos planos y el
 * ID de la asignacion docente relacionada, sin exponer el objeto completo.
 */
public class EvaluacionRespuesta {

    private Integer id;
    private Integer asignacionDocenteId;
    private String titulo;
    private String descripcion;
    private String tipo;
    private String periodo;
    private BigDecimal puntajeMaximo;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaCierre;
    private Boolean estado;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAsignacionDocenteId() { return asignacionDocenteId; }
    public void setAsignacionDocenteId(Integer asignacionDocenteId) { this.asignacionDocenteId = asignacionDocenteId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public BigDecimal getPuntajeMaximo() { return puntajeMaximo; }
    public void setPuntajeMaximo(BigDecimal puntajeMaximo) { this.puntajeMaximo = puntajeMaximo; }

    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }

    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }

    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
}
