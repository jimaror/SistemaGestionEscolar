package com.unmrma.escolar.dtos.justificacionausencia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO de solicitud para crear una justificacion de ausencia.
 * El estado siempre se fuerza a "Pendiente" y los campos de aprobacion
 * se dejan vacios, aunque el cliente los envíe.
 */
public class JustificacionAusenciaCrearRequest {

    @NotNull(message = "La asistencia es obligatoria")
    private Integer asistenciaId;

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 255, message = "El motivo no puede exceder 255 caracteres")
    private String motivo;

    @NotNull(message = "La fecha desde es obligatoria")
    private LocalDate fechaDesde;

    @NotNull(message = "La fecha hasta es obligatoria")
    private LocalDate fechaHasta;

    @Size(max = 255, message = "El documento adjunto no puede exceder 255 caracteres")
    private String documentoAdjunto;

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
}
