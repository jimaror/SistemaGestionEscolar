package com.unmrma.escolar.dtos.asistencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para registrar una asistencia. Solo director y maestro
 * pueden crearla. El campo registradoPor se fuerza desde la cuenta
 * autenticada en el controlador, no viene del cliente.
 */
public class AsistenciaCrearRequest {

    @NotNull(message = "La matrícula es obligatoria")
    private Integer matriculaId;

    @NotNull(message = "La asignación docente es obligatoria")
    private Integer asignacionDocenteId;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 20, message = "El estado no puede exceder 20 caracteres")
    private String estado;

    @Size(max = 255, message = "La observación no puede exceder 255 caracteres")
    private String observacion;

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
}
