package com.unmrma.escolar.dtos.justificacionausencia;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para una justificacion de ausencia.
 * Expone solo los campos planos y el ID de la asistencia relacionada.
 */
public class JustificacionAusenciaRespuesta {

    private Integer id;
    private Integer asistenciaId;
    private String motivo;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private String documentoAdjunto;
    private String estado;
    private Integer aprobadoPorId;
    private LocalDateTime fechaAprobacion;
    private String observacionAprobacion;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAsistenciaId() { return asistenciaId; }
    public void setAsistenciaId(Integer asistenciaId) { this.asistenciaId = asistenciaId; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDate getFechaDesde() { return fechaDesde; }
    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }
    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

    public String getDocumentoAdjunto() { return documentoAdjunto; }
    public void setDocumentoAdjunto(String documentoAdjunto) { this.documentoAdjunto = documentoAdjunto; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getAprobadoPorId() { return aprobadoPorId; }
    public void setAprobadoPorId(Integer aprobadoPorId) { this.aprobadoPorId = aprobadoPorId; }

    public LocalDateTime getFechaAprobacion() { return fechaAprobacion; }
    public void setFechaAprobacion(LocalDateTime fechaAprobacion) { this.fechaAprobacion = fechaAprobacion; }

    public String getObservacionAprobacion() { return observacionAprobacion; }
    public void setObservacionAprobacion(String observacionAprobacion) { this.observacionAprobacion = observacionAprobacion; }
}
