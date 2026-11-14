package com.unmrma.escolar.dtos.matricula;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO de solicitud para crear una matricula. El director puede matricular a
 * cualquier alumno; un alumno solo puede matricularse a sí mismo (el
 * alumnoId se fuerza desde la cuenta autenticada en el controlador).
 */
public class MatriculaCrearRequest {

    @NotNull(message = "El alumno es obligatorio")
    private Integer alumnoId;

    @NotNull(message = "La sección es obligatoria")
    private Integer seccionId;

    @NotNull(message = "El año escolar es obligatorio")
    private Integer anioEscolarId;

    private LocalDate fechaMatricula;

    private String estado = "Activa";

    @jakarta.validation.constraints.Size(max = 255, message = "Las observaciones no pueden exceder 255 caracteres")
    private String observaciones;

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
