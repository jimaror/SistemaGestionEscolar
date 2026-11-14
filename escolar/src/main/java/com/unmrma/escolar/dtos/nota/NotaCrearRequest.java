package com.unmrma.escolar.dtos.nota;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de solicitud para crear una nota. Solo director y maestro pueden
 * crearlas, y el maestro solo en sus propias asignaciones (valido en el
 * controlador). El registradoPor se fuerza desde la cuenta autenticada.
 */
public class NotaCrearRequest {

    @NotNull(message = "La matrícula es obligatoria")
    private Integer matriculaId;

    @NotNull(message = "La evaluación es obligatoria")
    private Integer evaluacionId;

    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 0, message = "La nota mínima es 0")
    @Max(value = 100, message = "La nota máxima es 100")
    private Double calificacion;

    private String periodo;

    private String observacion;

    public Integer getMatriculaId() { return matriculaId; }
    public void setMatriculaId(Integer matriculaId) { this.matriculaId = matriculaId; }

    public Integer getEvaluacionId() { return evaluacionId; }
    public void setEvaluacionId(Integer evaluacionId) { this.evaluacionId = evaluacionId; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
