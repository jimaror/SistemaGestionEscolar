package com.unmrma.escolar.dtos.nota;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * DTO de solicitud para actualizar una nota. Solo calificacion, periodo y
 * observacion son editables. No se puede cambiar la matricula ni la
 * evaluacion (evita mover la nota a otra matrícula o evaluación ajena).
 */
public class NotaActualizarRequest {

    @Min(value = 0, message = "La nota mínima es 0")
    @Max(value = 100, message = "La nota máxima es 100")
    private Double calificacion;

    private String periodo;

    private String observacion;

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
