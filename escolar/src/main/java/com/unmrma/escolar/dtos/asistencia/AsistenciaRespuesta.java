package com.unmrma.escolar.dtos.asistencia;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para una asistencia. Expone solo los campos planos y
 * los IDs de las entidades relacionadas, sin exponer objetos anidados
 * completos.
 */
public class AsistenciaRespuesta {

    private Integer id;
    private Integer matriculaId;
    private Integer asignacionDocenteId;
    private LocalDate fecha;
    private String estado;
    private String observacion;
    private Integer registradoPorId;
    private LocalDateTime fechaRegistro;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getMatriculaId() { return matriculaId; }
    public void setMatriculaId(Integer matriculaId) { this.matriculaId = matriculaId; }

    public Integer getAsignacionDocenteId() { return asignacionDocenteId; }
    public void setAsignacionDocenteId(Integer asignacionDocenteId) { this.asignacionDocenteId = asignacionDocenteId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Integer getRegistradoPorId() { return registradoPorId; }
    public void setRegistradoPorId(Integer registradoPorId) { this.registradoPorId = registradoPorId; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
