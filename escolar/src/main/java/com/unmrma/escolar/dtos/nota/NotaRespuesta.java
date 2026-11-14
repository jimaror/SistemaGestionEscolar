package com.unmrma.escolar.dtos.nota;

/**
 * DTO de respuesta para una nota. Expone solo los campos planos y los IDs
 * de las entidades relacionadas, sin exponer los objetos completos.
 */
public class NotaRespuesta {

    private Integer id;
    private Double calificacion;
    private String periodo;
    private Integer matriculaId;
    private Integer evaluacionId;
    private String observacion;
    private Integer registradoPorId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Integer getMatriculaId() { return matriculaId; }
    public void setMatriculaId(Integer matriculaId) { this.matriculaId = matriculaId; }

    public Integer getEvaluacionId() { return evaluacionId; }
    public void setEvaluacionId(Integer evaluacionId) { this.evaluacionId = evaluacionId; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public Integer getRegistradoPorId() { return registradoPorId; }
    public void setRegistradoPorId(Integer registradoPorId) { this.registradoPorId = registradoPorId; }
}
