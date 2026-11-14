package com.unmrma.escolar.dtos.asignaciondocente;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO de solicitud para crear una asignacion docente. Solo lo usa el director.
 * Todos los campos son obligatorios para evitar mass assignment parcial.
 */
public class AsignacionDocenteCrearRequest {

    @NotNull(message = "La asignatura es obligatoria")
    private Integer asignaturaId;

    @NotNull(message = "La seccion es obligatoria")
    private Integer seccionId;

    @NotNull(message = "El maestro es obligatorio")
    private Integer maestroId;

    @Positive(message = "Las horas semanales deben ser positivas")
    private Byte horasSemanales;

    public Integer getAsignaturaId() { return asignaturaId; }
    public void setAsignaturaId(Integer asignaturaId) { this.asignaturaId = asignaturaId; }

    public Integer getSeccionId() { return seccionId; }
    public void setSeccionId(Integer seccionId) { this.seccionId = seccionId; }

    public Integer getMaestroId() { return maestroId; }
    public void setMaestroId(Integer maestroId) { this.maestroId = maestroId; }

    public Byte getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(Byte horasSemanales) { this.horasSemanales = horasSemanales; }
}
