package com.unmrma.escolar.dtos.matricula;

import java.time.LocalDate;

/**
 * DTO de respuesta para una matricula. Expone solo los campos planos y los
 * IDs de las entidades relacionadas, sin exponer los objetos completos.
 */
public class MatriculaRespuesta {

    private Integer id;
    private Integer alumnoId;
    private Integer seccionId;
    private Integer anioEscolarId;
    private LocalDate fechaMatricula;
    private String estado;
    private String observaciones;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAlumnoId() { return alumnoId; }
    public void setAlumnoId(Integer alumnoId) { this.alumnoId = alumnoId; }

    public Integer getSeccionId() { return seccionId; }
    public void setSeccionId(Integer seccionId) { this.seccionId = seccionId; }

    public Integer getAnioEscolarId() { return anioEscolarId; }
    public void setAnioEscolarId(Integer anioEscolarId) { this.anioEscolarId = anioEscolarId; }

    public LocalDate getFechaMatricula() { return fechaMatricula; }
    public void setFechaMatricula(LocalDate fechaMatricula) { this.fechaMatricula = fechaMatricula; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
